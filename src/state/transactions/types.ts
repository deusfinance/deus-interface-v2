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
  SWAP,
  DEPOSIT,
  WITHDRAW,
  CLAIM,
  MIGRATE_ALL,
  MIGRATE,
  BRIDGE,
  MINT,
  LIQUIDITY,
}

interface BaseTransactionInfo {
  type: TransactionType
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL
  tokenAddress: string
  spender: string
}

export interface DepositTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.DEPOSIT
}

export interface WithdrawTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.WITHDRAW
}

export interface ClaimTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CLAIM
}

export interface MigrateAllTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.MIGRATE_ALL
}

export interface MigrateTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.MIGRATE
}
export interface BridgeTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.BRIDGE
}

export interface MintTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.MINT
}
export interface LiquidityTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.LIQUIDITY
}
export interface SwapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SWAP
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | DepositTransactionInfo
  | WithdrawTransactionInfo
  | ClaimTransactionInfo
  | MigrateAllTransactionInfo
  | MigrateTransactionInfo
  | BridgeTransactionInfo
  | MintTransactionInfo
  | LiquidityTransactionInfo
  | SwapTransactionInfo

export interface Approval {
  tokenAddress?: string
  spender?: string
}

export interface Vest {
  hash?: string
}

export interface TransactionDetails {
  hash: string
  approval?: Approval
  vest?: Vest
  summary?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}
