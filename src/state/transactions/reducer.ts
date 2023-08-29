import { createReducer } from '@reduxjs/toolkit'

import { TransactionDetails } from './types'
import { addTransaction, clearAllTransactions, checkedTransaction, finalizeTransaction } from './actions'

const now = () => new Date().getTime()

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTransaction, (state, { payload: { chainId, from, info, hash, summary } }) => {
      if (state[chainId]?.[hash]) {
        throw new Error('Attempted to add existing transaction.')
      }
      const txs = state[chainId] ?? {}
      txs[hash] = {
        hash,
        info,
        from,
        summary,
        addedTime: now(),
      }
      txs[hash] = { hash, info, from, summary, addedTime: now() }
      state[chainId] = txs
    })
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
)
