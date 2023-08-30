import { SupportedChainId } from './chains'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`NEXT_PUBLIC_INFURA_KEY must be a defined environment variable`)
}

/**
 * Fallback JSON-RPC endpoints.
 * These are used if the integrator does not provide an endpoint, or if the endpoint does not work.
 *
 * MetaMask allows switching to any URL, but displays a warning if it is not on the "Safe" list:
 * https://github.com/MetaMask/metamask-mobile/blob/bdb7f37c90e4fc923881a07fca38d4e77c73a579/app/core/RPCMethods/wallet_addEthereumChain.js#L228-L235
 * https://chainid.network/chains.json
 *
 * These "Safe" URLs are listed first, followed by other fallback URLs, which are taken from chainlist.org.
 */
export const FALLBACK_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.ARBITRUM]: [
    // "Safe" URLs
    'https://autumn-white-lambo.arbitrum-mainnet.quiknode.pro/6420539dc40ba5c44aa97b994a9d61a56deb16db/',
    // "Fallback" URLs
    'https://arbitrum.public-rpc.com',
  ],
  [SupportedChainId.FANTOM]: ['https://fantom-mainnet.public.blastapi.io', 'https://fantom.publicnode.com'],
  [SupportedChainId.MAINNET]: ['https://rpc.ankr.com/eth', 'https://eth.llamarpc.com'],
  [SupportedChainId.AVALANCHE]: ['https://rpc.ankr.com/avalanche', 'https://1rpc.io/avax/c'],
  [SupportedChainId.BSC]: ['https://rpc.ankr.com/bsc', 'https://bsc.publicnode.com'],
  [SupportedChainId.KAVA]: ['https://kava-evm.publicnode.com', 'https://evm2.kava.io'],
  [SupportedChainId.METIS]: ['https://metis-mainnet.public.blastapi.io'],
  [SupportedChainId.POLYGON]: ['https://polygon-rpc.com', 'https://poly-rpc.gateway.pokt.network'],
}

export const RPC_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.ARBITRUM]: [`https://arb1.arbitrum.io/rpc`, ...FALLBACK_URLS[SupportedChainId.ARBITRUM]],
  [SupportedChainId.FANTOM]: ['https://rpc.ftm.tools'],
  [SupportedChainId.MAINNET]: ['https://ethereum.publicnode.com'],
  [SupportedChainId.AVALANCHE]: ['https://avalanche.public-rpc.com'],
  [SupportedChainId.BSC]: ['https://rpc.ankr.com/bsc'],
  [SupportedChainId.KAVA]: ['wss://wevm.kava.io'],
  [SupportedChainId.METIS]: ['https://andromeda.metis.io/?owner=1088'],
  [SupportedChainId.POLYGON]: ['https://polygon.llamarpc.com'],
}
