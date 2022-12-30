import { Token } from '@sushiswap/core-sdk'
import { DEUS_TOKEN, DEUS_VDEUS_LP_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { useV2GetApy } from 'hooks/useStakingInfo'
import { MasterChefV3, StablePool_DEUS_vDEUS } from './addresses'
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
  provideLink?: string
  aprHook: (h: StakingType) => number
  masterChef: string
  pid: number
  active: boolean
  version: StakingVersion
}

export type LiquidityType = {
  id: number
  tokens: Token[]
  provideLinks?: ProvideTokens[]
  lpToken: Token
  contract?: string
}

export const LiquidityPool: LiquidityType[] = [
  {
    id: 0,
    tokens: [DEUS_TOKEN, VDEUS_TOKEN],
    provideLinks: [
      {
        id: 0,
        title: 'Buy on Firebird',
        link: 'https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250',
      },
      { id: 1, title: 'Go to Swap Page', link: '/swap' },
    ],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    contract: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
  },
]

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'DEUS-vDEUS',
    rewardTokens: [VDEUS_TOKEN],
    provideLink: '/stake',
    aprHook: useV2GetApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    version: StakingVersion.V2,
  },
]
