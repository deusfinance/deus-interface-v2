import { useCallback, useMemo } from 'react'
import type { TransactionResponse } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@uniswap/sdk-core'

import { useAppDispatch, useAppSelector } from 'state'
import { addTransaction } from './actions'
import { TransactionDetails, TransactionInfo, TransactionType } from './types'

export interface TransactionResponseLight {
  hash: string
}

// helper that can take a ethers provider transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  info: TransactionInfo,
  summary?: string
) => void {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()

  return useCallback(
    (response: TransactionResponse, info: TransactionInfo, summary?: string) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, info, chainId, summary }))
    },
    [account, chainId, dispatch]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useWeb3React()

  const state = useAppSelector((state) => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

export function useTransaction(transactionHash?: string): TransactionDetails | undefined {
  const allTransactions = useAllTransactions()

  if (!transactionHash) {
    return undefined
  }

  return allTransactions[transactionHash]
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

export function useIsTransactionConfirmed(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return Boolean(transactions[transactionHash].receipt)
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(token?: Token, spender?: string): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof token?.address === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          if (tx.info.type !== TransactionType.APPROVAL) return false
          return tx.info.spender === spender && tx.info.tokenAddress === token.address && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, token?.address]
  )
}

export function usePendingApprovalList(currenciesAddress: string[] | null, spender: string | null | undefined) {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof spender === 'string' &&
      currenciesAddress &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return (
            approval.spender === spender &&
            approval.tokenAddress &&
            currenciesAddress?.includes(approval.tokenAddress) &&
            isTransactionRecent(tx)
          )
        }
      }),
    [allTransactions, spender, currenciesAddress]
  )
}

export function useHasPendingVest(hash: string | null | undefined, isSingleTx?: boolean) {
  const allTransactions = useAllTransactions()
  return useMemo(() => {
    if (!isSingleTx) {
      return (
        typeof hash === 'string' &&
        Object.keys(allTransactions).some((hash) => {
          const tx = allTransactions[hash]
          if (!tx) return false
          if (tx.receipt) {
            return false
          } else {
            const vest = tx.vest
            if (!vest) return false
            return vest.hash === hash && isTransactionRecent(tx)
          }
        })
      )
    } else {
      const selectedHash = Object.keys(allTransactions).find((hashItem) => hashItem === hash)
      if (selectedHash) {
        const tx = allTransactions[selectedHash]
        if (!tx) return false
        if (tx?.receipt) {
          return false
        } else {
          const vest = tx?.vest
          if (!vest) return false
          return vest.hash === hash && isTransactionRecent(tx)
        }
      }
    }
  }, [allTransactions, hash, isSingleTx])
}
