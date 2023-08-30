import { deepCopy } from '@ethersproject/properties'
// This is the only file which should instantiate new Providers.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { isPlain } from '@reduxjs/toolkit'

import { AVERAGE_L1_BLOCK_TIME } from './misc'
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from './chains'
import { RPC_URLS } from './networks'

class AppJsonRpcProvider extends StaticJsonRpcProvider {
  private _blockCache = new Map<string, Promise<any>>()
  get blockCache() {
    // If the blockCache has not yet been initialized this block, do so by
    // setting a listener to clear it on the next block.
    if (!this._blockCache.size) {
      this.once('block', () => this._blockCache.clear())
    }
    return this._blockCache
  }

  constructor(chainId: SupportedChainId) {
    // Including networkish allows ethers to skip the initial detectNetwork call.
    super(RPC_URLS[chainId][0], /* networkish= */ { chainId, name: CHAIN_IDS_TO_NAMES[chainId] })

    // NB: Third-party providers (eg MetaMask) will have their own polling intervals,
    // which should be left as-is to allow operations (eg transaction confirmation) to resolve faster.
    // Network providers (eg AppJsonRpcProvider) need to update less frequently to be considered responsive.
    this.pollingInterval = AVERAGE_L1_BLOCK_TIME
  }

  send(method: string, params: Array<any>): Promise<any> {
    // Only cache eth_call's.
    if (method !== 'eth_call') return super.send(method, params)

    // Only cache if params are serializable.
    if (!isPlain(params)) return super.send(method, params)

    const key = `call:${JSON.stringify(params)}`
    const cached = this.blockCache.get(key)
    if (cached) {
      this.emit('debug', {
        action: 'request',
        request: deepCopy({ method, params, id: 'cache' }),
        provider: this,
      })
      return cached
    }

    const result = super.send(method, params)
    this.blockCache.set(key, result)
    return result
  }
}

/**
 * These are the only JsonRpcProviders used directly by the interface.
 */
export const RPC_PROVIDERS: { [key in SupportedChainId]: StaticJsonRpcProvider } = {
  [SupportedChainId.ARBITRUM]: new AppJsonRpcProvider(SupportedChainId.ARBITRUM),
  [SupportedChainId.AVALANCHE]: new AppJsonRpcProvider(SupportedChainId.AVALANCHE),
  [SupportedChainId.BSC]: new AppJsonRpcProvider(SupportedChainId.BSC),
  [SupportedChainId.FANTOM]: new AppJsonRpcProvider(SupportedChainId.FANTOM),
  [SupportedChainId.KAVA]: new AppJsonRpcProvider(SupportedChainId.KAVA),
  [SupportedChainId.MAINNET]: new AppJsonRpcProvider(SupportedChainId.MAINNET),
  [SupportedChainId.METIS]: new AppJsonRpcProvider(SupportedChainId.METIS),
  [SupportedChainId.POLYGON]: new AppJsonRpcProvider(SupportedChainId.POLYGON),
}
