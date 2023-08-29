import BigNumber from 'bignumber.js'
import { PairData } from 'types/pair'

export type VoteData = {
  pair: PairData
  userVoteAmount: BigNumber
  userStakeAmount: BigNumber
}

export type UserVote = {
  address: string
  percent: string
}

export enum TableFilter {
  ALL = 'ALL',
  V1_POOLS = 'V1 POOLS',
  CL_POOLS = 'CL POOLS',
  MY_VOTES = 'MY VOTES',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortColumn {
  POOL = 'symbol',
  TVL = 'tvl',
  APR = 'voteAPR',
  BRIBE = 'totalCurrentVoteBribeUsd',
  TOTAL_VOTES = 'totalVotes',
  USER_VOTE = 'userVoteAmount',
  ESTIMATE_REWARD = 'estimateReward',
}
