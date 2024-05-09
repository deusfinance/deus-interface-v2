import WalletConnectProvider from '@walletconnect/ethereum-provider'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'

import { ArrayOneOrMore, getBestUrlMap, getChainsWithDefault, isArrayOneOrMore } from './utils'

export const URI_AVAILABLE = 'URI_AVAILABLE'

const DEFAULT_TIMEOUT = 5000

export type WalletConnectOptions = Omit<Parameters<typeof WalletConnectProvider.init>[0], 'rpcMap'> & {
  /**
   * Map of chainIds to rpc url(s). If multiple urls are provided, the first one that responds
   * within a given timeout will be used. Note that multiple urls are not supported by WalletConnect by default.
   * That's why we extend its options with our own `rpcMap` (@see getBestUrlMap).
   */
  rpcMap?: { [chainId: number]: string | string[] }
  /** @deprecated Use `rpcMap` instead. */
  rpc?: { [chainId: number]: string | string[] }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

/**
 * Necessary type to interface with @walletconnect/ethereum-provider@2.9.2 which is currently unexported
 */
type ChainsProps =
  | {
      chains: ArrayOneOrMore<number>
      optionalChains?: number[]
    }
  | {
      chains?: number[]
      optionalChains: ArrayOneOrMore<number>
    }

/**
 * Options to configure the WalletConnect connector.
 */
export interface WalletConnectConstructorArgs {
  /** Options to pass to `@walletconnect/ethereum-provider`. */
  options: WalletConnectOptions
  /** The chainId to connect to in activate if one is not provided. */
  defaultChainId?: number
  /**
   * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
   * online urls.
   */
  timeout?: number
  /**
   * @param onError - Handler to report errors thrown from WalletConnect.
   */
  onError?: (error: Error) => void
}

export class WalletConnectV2Connector extends AbstractConnector {
  public walletConnectProvider?: WalletConnectProvider
  private readonly options: Omit<WalletConnectOptions, 'rpcMap' | 'chains'>

  private readonly rpcMap?: Record<number, string | string[]>
  private readonly chains: number[] | ArrayOneOrMore<number> | undefined
  private readonly optionalChains: number[] | ArrayOneOrMore<number> | undefined
  private readonly defaultChainId?: number
  private readonly timeout: number

  private eagerConnection?: Promise<WalletConnectProvider>

  constructor({ defaultChainId, options, timeout = DEFAULT_TIMEOUT, onError }: WalletConnectConstructorArgs) {
    super({ supportedChainIds: undefined })

    const { rpcMap, rpc, ...rest } = options

    this.options = rest
    this.defaultChainId = defaultChainId
    this.rpcMap = rpcMap || rpc
    this.timeout = timeout

    const { chains, optionalChains } = this.getChainProps(rest.chains, rest.optionalChains, defaultChainId)
    this.chains = chains
    this.optionalChains = optionalChains

    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
  }

  private getChainProps(
    chains: number[] | ArrayOneOrMore<number> | undefined,
    optionalChains: number[] | ArrayOneOrMore<number> | undefined,
    desiredChainId: number | undefined = this.defaultChainId
  ): ChainsProps {
    // Reorder chains and optionalChains if necessary
    const orderedChains = getChainsWithDefault(chains, desiredChainId)
    const orderedOptionalChains = getChainsWithDefault(optionalChains, desiredChainId)

    // Validate and return the result.
    // Type discrimination requires that we use these typeguard checks to guarantee a valid return type.
    if (isArrayOneOrMore(orderedChains)) {
      return { chains: orderedChains, optionalChains: orderedOptionalChains }
    } else if (isArrayOneOrMore(orderedOptionalChains)) {
      return { chains: orderedChains, optionalChains: orderedOptionalChains }
    }

    throw new Error('Either chains or optionalChains must have at least one item.')
  }

  private handleChainChanged(chainId: number | string): void {
    this.emitUpdate({ chainId })
  }

  private handleAccountsChanged(accounts: string[]): void {
    this.emitUpdate({ account: accounts[0] })
  }

  private handleDisconnect(): void {
    // we have to do this because of a @walletconnect/web3-provider bug
    if (this.walletConnectProvider) {
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
      this.walletConnectProvider = undefined
    }
    this.emitDeactivate()
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletConnectProvider) {
      const rpcMap = this.rpcMap ? getBestUrlMap(this.rpcMap, this.timeout) : undefined
      const chainProps = this.getChainProps(this.chains, this.optionalChains)
      const ethProviderModule = await import('@walletconnect/ethereum-provider')
      this.walletConnectProvider = await ethProviderModule.default.init({
        ...this.options,
        ...chainProps,
        rpcMap: await rpcMap,
      })
    }

    // ensure that the uri is going to be available, and emit an event if there's a new uri
    // if (!this.walletConnectProvider.connector.connected) {
    //   await this.walletConnectProvider.connector.createSession(
    //     this.config.chainId ? { chainId: this.config.chainId } : undefined
    //   )
    //   this.emit(URI_AVAILABLE, this.walletConnectProvider.connector.uri)
    // }

    let account: string
    account = await new Promise<string>((resolve, reject) => {
      const userReject = () => {
        // Erase the provider manually
        this.walletConnectProvider = undefined
        reject(new UserRejectedRequestError())
      }

      // Workaround to bubble up the error when user reject the connection
      this.walletConnectProvider!.on('disconnect', () => {
        // Check provider has not been enabled to prevent this event callback from being called in the future
        if (!account) {
          userReject()
        }
      })

      this.walletConnectProvider!.enable()
        .then((accounts: string[]) => resolve(accounts[0]))
        .catch((error: Error): void => {
          // TODO ideally this would be a better check
          if (error.message === 'User closed modal') {
            userReject()
            return
          }
          reject(error)
        })
    }).catch((err) => {
      throw err
    })

    this.walletConnectProvider.on('disconnect', this.handleDisconnect)
    this.walletConnectProvider.on('chainChanged', this.handleChainChanged)
    this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged)

    return { provider: this.walletConnectProvider, account }
  }

  public async getProvider(): Promise<any> {
    return this.walletConnectProvider
  }

  public async getChainId(): Promise<number | string> {
    return Promise.resolve(this.walletConnectProvider!.chainId)
  }

  public async getAccount(): Promise<null | string> {
    return Promise.resolve(this.walletConnectProvider!.accounts).then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    if (this.walletConnectProvider) {
      this.walletConnectProvider.removeListener('disconnect', this.handleDisconnect)
      this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged)
      this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged)
      this.walletConnectProvider.disconnect()
    }
  }

  public async close() {
    this.emitDeactivate()
  }
}
