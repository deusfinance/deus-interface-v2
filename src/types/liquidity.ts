import BigNumber from 'bignumber.js'
import { PairData } from 'types/pair'

export type VoteData = {
  pair: PairData
  userVoteAmount: BigNumber
  userStakeAmount: BigNumber
}

export enum ManageLiquidity {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum ManageStake {
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

export enum TableFilter {
  ALL = 'ALL',
  V1_POOLS = 'V1 POOLS',
  CL_POOLS = 'CL POOLS',
  MY_POOLS = 'MY POOLS',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortColumn {
  POOL = 'symbol',
  POOL_AMOUNT = 'poolAmount',
  TVL = 'tvl',
  APR = 'lpAPR',
  USER_Pool = 'userPoolAmount',
  USER_STAKE = 'userStakeAmount',
}

export enum StakeState {
  NO_TOKENS,
  POOL_NOT_FOUND,
  NO_GAUGE,
  HAS_GAUGE,
}
