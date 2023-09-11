// We allow the user to connect with these chains, so we can force them to change to Fantom.

import { useRouter } from 'next/router'
import { useMemo } from 'react'

// E.g. if the user's chain is not in the list, web3react will deny connection and then we can't change to Fantom.
export enum AllChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  TELOS = 40,
  XDAI = 100,
  FUSE = 122,
  CELO = 42220,

  BSC = 56,
  BSC_TESTNET = 97,

  OKEX_TESTNET = 65,
  OKEX = 66,

  HECO = 128,
  HECO_TESTNET = 256,

  POLYGON = 137,
  POLYGON_TESTNET = 80001,

  FANTOM = 250,
  FANTOM_TESTNET = 4002,

  MOONRIVER = 1285,
  MOONBEAM_TESTNET = 1287,

  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 79377087078960,

  AVALANCHE_TESTNET = 43113,
  AVALANCHE = 43114,

  HARMONY = 1666600000,
  HARMONY_TESTNET = 1666700000,

  PALM = 11297108109,
  PALM_TESTNET = 11297108099,

  METIS = 1088,
  KAVA = 2222,
  BASE = 8453,
}

export enum SupportedChainId {
  MAINNET = 1,
  BSC = 56,
  POLYGON = 137,
  FANTOM = 250,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  METIS = 1088,
  KAVA = 2222,
  BASE = 8453,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.FANTOM]: 'Fantom',
  [SupportedChainId.ARBITRUM]: 'Arbitrum',
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.POLYGON]: 'Polygon',
  [SupportedChainId.BSC]: 'BSC',
  [SupportedChainId.AVALANCHE]: 'Avalanche',
  [SupportedChainId.METIS]: 'Metis',
  [SupportedChainId.KAVA]: 'Kava',
  [SupportedChainId.BASE]: 'Base',
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

export function isSupportedChain(chainId: number | null | undefined): chainId is SupportedChainId {
  return !!chainId && !!SupportedChainId[chainId]
}

export const APP_CHAIN_IDS = [SupportedChainId.FANTOM]
export const FALLBACK_CHAIN_ID = SupportedChainId.FANTOM

export const MIGRATION_CHAIN_IDS = [
  SupportedChainId.FANTOM,
  SupportedChainId.ARBITRUM,
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.BSC,
  SupportedChainId.AVALANCHE,
  SupportedChainId.METIS,
  SupportedChainId.KAVA,
]

export const BRIDGE_CHAIN_IDS = [
  SupportedChainId.BSC,
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.KAVA,
  SupportedChainId.BASE,
]

export function usePreferredChain() {
  const router = useRouter()
  return useMemo(() => {
    if (router.route.includes('/migration')) return MIGRATION_CHAIN_IDS[0]
    else if (router.route.includes('/bridge')) return BRIDGE_CHAIN_IDS[0]
    return APP_CHAIN_IDS[0]
  }, [router.route])
}

export const NETWORK_URLS: { [chainId: number]: string } = {
  [SupportedChainId.FANTOM]: 'https://rpc.ftm.tools',
}
