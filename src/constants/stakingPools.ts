import { Token } from '@sushiswap/core-sdk'
import { DEUS_TOKEN, DEUS_VDEUS_LP_TOKEN, XDEUS_TOKEN } from 'constants/tokens'
import { useGetDeusApy, useGetTvl, useV2GetApy } from 'hooks/useStakingInfo'
import { useDeusPrice } from 'state/dashboard/hooks'
import { MasterChefV3, StablePool_DEUS_vDEUS } from './addresses'
import { ChainInfo } from './chainInfo'
import { SupportedChainId } from './chains'

export enum StakingVersion {
  V1,
  V2,
  NFT,
  EXTERNAL,
}

export type ProvideTokens = {
  id: number
  title: string
  link: string
}

export type StakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  token?: Token
  provideLink?: string
  aprHook: (h: StakingType) => number
  tvlHook: (h: StakingType) => number
  secondaryAprHook: (liqPool?: any, stakingPool?: any) => number
  masterChef: string
  pid: number
  active: boolean
  hasSecondaryApy?: boolean
  version: StakingVersion
  isSingleStaking?: boolean
  chain: string
}

export type ExternalStakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  provideLink: string
  active: boolean
  version: StakingVersion
  chain: string
  contract: Token
  aprHook: (h: any) => number
  tvlHook: (h: any) => number
}

export type LiquidityType = {
  id: number
  label: string
  tokens: Token[]
  provideLinks?: ProvideTokens[]
  lpToken: Token
  contract?: string
  priceToken?: Token
  priceHook: () => string
}

export const LiquidityPool: LiquidityType[] = [
  {
    id: 0,
    label: 'xDEUS - DEUS Staking',
    tokens: [XDEUS_TOKEN, DEUS_TOKEN],
    provideLinks: [
      { id: 0, title: 'Go to Swap Page', link: '/xdeus/swap' },
      {
        id: 1,
        title: 'Buy on Firebird',
        link: 'https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250',
      },
    ],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    contract: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    priceToken: DEUS_TOKEN,
    priceHook: useDeusPrice,
  },
  {
    id: 1,
    label: 'xDEUS Single Staking',
    tokens: [XDEUS_TOKEN],
    lpToken: XDEUS_TOKEN,
    priceToken: DEUS_TOKEN,
    priceHook: useDeusPrice,
  },
]

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'xDEUS-DEUS',
    rewardTokens: [XDEUS_TOKEN, DEUS_TOKEN],
    token: DEUS_VDEUS_LP_TOKEN,
    aprHook: useV2GetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    hasSecondaryApy: true,
    version: StakingVersion.V2,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
  },
  {
    id: 1,
    name: 'xDEUS',
    rewardTokens: [XDEUS_TOKEN],
    token: XDEUS_TOKEN,
    aprHook: useV2GetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy, // it doesn't return any deus reward for this pool, but you can't have conditional hooks. But the hook handles this scenario internally
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    hasSecondaryApy: false,
    version: StakingVersion.V2,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
  },
]

// export const ExternalStakings: ExternalStakingType[] = [
//   {
//     id: 2,
//     name: 'xDEUS-DEUS',
//     rewardTokens: [XDEUS_TOKEN, SOLID_TOKEN],
//     provideLink: 'https://solidly.com/liquidity/0x4EF3fF9dadBa30cff48133f5Dc780A28fc48693F',
//     active: true,
//     contract: XDEUS_DEUS_SOLIDLY_LP,
//     aprHook: useSolidlyApy,
//     tvlHook: useSolidlyTvl,
//     version: StakingVersion.EXTERNAL,
//     chain: ChainInfo[SupportedChainId.MAINNET].label,
//   },
// ]
