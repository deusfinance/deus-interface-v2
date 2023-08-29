import { Token } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'

export enum PairType {
  V1 = 'Ve',
  V2 = 'CL',
}

export interface PairData {
  type: PairType

  index: number
  name: string
  symbol: string
  address: string
  decimals: number
  alive: boolean

  reserve0: BigNumber
  reserve1: BigNumber
  reserve0Usd: BigNumber
  reserve1Usd: BigNumber

  token0: Token
  token1: Token
  icon0: string
  icon1: string
  price0: BigNumber
  price1: BigNumber

  gaugeAddress: string
  feeDistributorAddress: string
  feeDistributorTokensAddresses: string[]
  rewardTokensAddresses: string[]
  currentVoteBribes: BribeToken[]
  projectedFees: BribeToken[]
  xRamRatio: number

  totalCurrentVoteBribeUsd: BigNumber
  totalVotes: BigNumber
  estimateReward: BigNumber

  totalSupply: BigNumber
  gaugeTotalSupply: BigNumber

  tvl: BigNumber
  lpPrice: BigNumber

  lpAPR: BigNumber
  projectedFeesAPR: BigNumber
  bribeAPR: BigNumber
  voteAPR: BigNumber

  //user stats
  userVoteAmount: BigNumber | undefined
  userStakeAmount: BigNumber | undefined
  userPoolAmount: BigNumber | undefined
  userBoostAmount: BigNumber | undefined
  userPoolValue: BigNumber | undefined
}

export interface PairV1Data extends PairData {
  type: PairType.V1
  stable: boolean
}

export interface PairV2Data extends PairData {
  type: PairType.V2
  tick: BigNumber
  feeTier: BigNumber
  feeAPR: BigNumber
}

export type BribeToken = {
  token: Token
  price: BigNumber
  tokenTotalSupplyByPeriod: BigNumber
  totalUSD: BigNumber
}

export type UserPairData = {
  address: string
  rewards: BigNumber[] //per rewardsToken in  PoolData
  deposited: BigNumber
}

export enum V1Type {
  STABLE = 'CORRELATED',
  VOLATILE = 'VOLATILE',
}

export enum ManageFilter {
  STAKE = 'Stake',
  UN_STAKE = 'Unstake',
}

export enum SortColumn {
  POOL = 'symbol',
  TVL = 'moSolidTVL',
  APR = 'moSolidApr',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}
