import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import { NetworkConnector } from './NetworkConnector'

import { getLibrary } from 'utils/library'

import { FALLBACK_CHAIN_ID, NETWORK_URLS, SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { WalletConnectV2Connector } from './WalletConnectV2Connector'

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: FALLBACK_CHAIN_ID,
})

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})

export const walletconnect = new WalletConnectV2Connector({
  options: {
    projectId: 'c84c04f4e4c5f8d2ee32d6d667de8a57',
    chains: [250],
    optionalChains: [1, 250, 42161],
    showQrModal: true,
    qrModalOptions: {
      themeVariables: {
        '--wcm-z-index': '9999999',
      },
    },
  },
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[FALLBACK_CHAIN_ID],
  appName: 'DEUS Finance',
  appLogoUrl: require('/public/static/images/AppLogo.png'),
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})
