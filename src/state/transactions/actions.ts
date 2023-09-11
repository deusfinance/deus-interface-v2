import { createAction } from '@reduxjs/toolkit'

import { Approval, SerializableTransactionReceipt, TransactionInfo, Vest } from './types'

export const addTransaction = createAction<{
  chainId: number
  from: string
  hash: string
  info: TransactionInfo
  summary?: string
  approval?: Approval
  vest?: Vest
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: number }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: number
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: number
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')
