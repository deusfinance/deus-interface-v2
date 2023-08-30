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
}

interface BaseTransactionInfo {
  type: TransactionType
}

export interface WrapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.WRAP
  wrap: boolean
  amount: string
}

export type TransactionInfo = WrapTransactionInfo

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
