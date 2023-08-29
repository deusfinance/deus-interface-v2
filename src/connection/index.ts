// import { OKX } from './OkProvider'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect as WalletConnectV1 } from '@web3-react/walletconnect'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { Connector } from '@web3-react/types'

import { APP_CHAIN_IDS, FALLBACK_CHAIN_ID, SupportedChainId, RPC_URLS } from 'constants/chains'
import { RPC_PROVIDERS } from 'constants/providers'
import { Z_INDEX } from 'theme'

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  WALLET_CONNECT_V2 = 'WALLET_CONNECT_V2',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  OKX = 'OKX_WALLET',
}

export interface Connection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
}

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: FALLBACK_CHAIN_ID })
)
export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
export const injectedConnection: Connection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
}

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>((actions) => new GnosisSafe({ actions }))
export const gnosisSafeConnection: Connection = {
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
}

const [web3WalletConnectV1, web3WalletConnectHooksV1] = initializeConnector<WalletConnectV1>((actions) => {
  // Avoid testing for the best URL by only passing a single URL per chain.
  // Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react).
  const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(RPC_URLS).reduce(
    (map, [chainId, urls]) => ({
      ...map,
      [chainId]: urls[0],
    }),
    {}
  )

  return new WalletConnectV1({
    actions,
    options: {
      rpc: RPC_URLS_WITHOUT_FALLBACKS,
      qrcode: true,
    },
    onError,
  })
})

export const walletConnectConnectionV1: Connection = {
  connector: web3WalletConnectV1,
  hooks: web3WalletConnectHooksV1,
  type: ConnectionType.WALLET_CONNECT,
}

const defaultChainId = SupportedChainId.ARBITRUM

const [web3WalletConnectV2, web3WalletConnectHooksV2] = initializeConnector<WalletConnectV2>((actions) => {
  // Avoid testing for the best URL by only passing a single URL per chain.
  // Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react).
  const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(RPC_URLS).reduce(
    (map, [chainId, urls]) => ({
      ...map,
      [chainId]: urls[0],
    }),
    {}
  )
  console.log({ RPC_URLS_WITHOUT_FALLBACKS })

  return new WalletConnectV2({
    actions,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
      chains: [defaultChainId],
      rpc: RPC_URLS_WITHOUT_FALLBACKS,
      optionalChains: APP_CHAIN_IDS,
      showQrModal: true,
      rpcMap: RPC_URLS_WITHOUT_FALLBACKS,
      qrModalOptions: {
        enableExplorer: true,
        explorerExcludedWalletIds: undefined,
        explorerRecommendedWalletIds: undefined,
        privacyPolicyUrl: undefined,
        termsOfServiceUrl: undefined,
        themeMode: 'dark',
        themeVariables: {
          '--wcm-font-family': '"Inter custom", sans-serif',
          '--wcm-z-index': Z_INDEX.modal.toString(),
        },
      },
    },
    onError,
  })
})

export const walletConnectConnectionV2: Connection = {
  connector: web3WalletConnectV2,
  hooks: web3WalletConnectHooksV2,
  type: ConnectionType.WALLET_CONNECT_V2,
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[FALLBACK_CHAIN_ID][0],
        appName: 'DEUS',
        reloadOnDisconnect: false,
      },
      onError,
    })
)

export const coinbaseWalletConnection: Connection = {
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
}

// export const [okxWallet, okxWalletHooks] = initializeConnector<OKX>((actions) => new OKX({ actions }))
// export const okxConnection: Connection = {
//   connector: okxWallet,
//   hooks: okxWalletHooks,
//   type: ConnectionType.OKX,
// }
