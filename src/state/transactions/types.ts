import { RewardType } from 'types/veRam'
import { UserVote } from 'types/vote'
import { ManageXRam } from 'types/xram'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
export enum TransactionType {
  APPROVAL = 0,
  CAST,
  RESET_VOTE,
  WRAP,
  SWAP,
  ClaimReward,
  ClaimAll,
  CREATE_LOCK,
  INCREASE_LOCK,
  EXTEND_LOCK,
  UNLOCK,
  LP_BRIBE,
  VOTE_BRIBE,
  ADD_LIQUIDITY,
  WITHDRAW_LIQUIDITY,
  STAKE_IN_GAUGE,
  UNSTAKE_FROM_GAUGE,
  CREATE_GAUGE,
  ATTACH_TO_V2,
  TRANSFER_VERAM,
  MERGE_VERAM,
  APPROVAL_NFT,

  //XRAM
  XRAM_VEST,
}

interface BaseTransactionInfo {
  type: TransactionType
}

export interface CreateVestTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CAST
  tokenId: string
  userVotes: UserVote[]
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL
  tokenAddress: string
  spender: string
}

export interface ApproveNFTTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL_NFT
  nftAddress: string
  spender: string
  forAll: boolean
  tokenId: string
}
export interface CastVotesTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CAST
  tokenId: string
  userVotes: UserVote[]
}

export interface ResetVotesTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.RESET_VOTE
  tokenId: string
}

export interface WrapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.WRAP
  wrap: boolean
  amount: string
}

export interface SwapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SWAP
  inputAmount: string | undefined
  outputAmount: string
  inputCurrencyId: string
  outputCurrencyId: string
  slippage: number
}

export interface ClaimAllTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ClaimAll
  rewardType: RewardType
}

export interface ClaimDistributionTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ClaimReward
  rewardType: RewardType.DISTRIBUTION
  tokenId: string
  amount: string
}

export interface ClaimRewardTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ClaimReward
  rewardType: RewardType.BRIBE | RewardType.GAUGE
  poolAddress: string
  tokenId: string
  amount: string[]
  tokenAddress: string[]
}

export interface CreateLockTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CREATE_LOCK
  amount: string
  expireTime: number
}

export interface ExtendLockTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.INCREASE_LOCK | TransactionType.EXTEND_LOCK
  amount: string
  expireTime: number
  tokenId: string | number
}
export interface UnLockTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.UNLOCK
  tokenId: number
}
export interface BribeTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.LP_BRIBE | TransactionType.VOTE_BRIBE
  inputAmount: string | undefined
  currencyId: string
  poolSymbol: string
}
export interface CreateGaugeTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CREATE_GAUGE
  poolAddress: string
  poolSymbol: string
}

export interface AddLiquidityTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ADD_LIQUIDITY
  create: boolean
  token0Amount: string | undefined
  token1Amount: string | undefined
  token0CurrencyId: string
  token1CurrencyId: string
  poolSymbol: string
  poolAddress: string
}
export interface WithdrawLiquidityTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.WITHDRAW_LIQUIDITY
  liquidityAmount: string | undefined
  poolSymbol: string
  poolAddress: string
}
export interface StakeInGaugeTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.STAKE_IN_GAUGE | TransactionType.UNSTAKE_FROM_GAUGE
  amount: string | undefined
  maxBalance: boolean | undefined
  poolSymbol: string
}

export interface AttachToV2TransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ATTACH_TO_V2
  positionId: string
  tokenId: string
}

export interface TransferVeRamTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.TRANSFER_VERAM
  tokenId: string
  to: string
  from: string
}

export interface MergeVeRamTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.MERGE_VERAM
  to: number
  from: number
}
export interface XRamTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.XRAM_VEST
  manageType: ManageXRam
  amount: string
  ve: boolean | undefined
  tokenId: string | undefined
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | ApproveNFTTransactionInfo
  | CastVotesTransactionInfo
  | ResetVotesTransactionInfo
  | SwapTransactionInfo
  | WrapTransactionInfo
  | ClaimAllTransactionInfo
  | ClaimDistributionTransactionInfo
  | ClaimRewardTransactionInfo
  | CreateLockTransactionInfo
  | ExtendLockTransactionInfo
  | UnLockTransactionInfo
  | BribeTransactionInfo
  | CreateGaugeTransactionInfo
  | AddLiquidityTransactionInfo
  | WithdrawLiquidityTransactionInfo
  | StakeInGaugeTransactionInfo
  | AttachToV2TransactionInfo
  | TransferVeRamTransactionInfo
  | MergeVeRamTransactionInfo
  | XRamTransactionInfo

export interface TransactionDetails {
  hash: string
  summary?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}
