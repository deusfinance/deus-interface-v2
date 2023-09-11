import { useCallback, useMemo } from 'react'

import { useTransactionAdder } from 'state/transactions/hooks'
import { useWeb3React } from '@web3-react/core'
import { useCLQDRContract } from 'hooks/useContract'
import { createTransactionCallback, TransactionCallbackState } from 'utils/web3'
import { toBN } from 'utils/numbers'
import { useCalcSharesFromAmount } from 'hooks/useClqdrPage'
import { MintTransactionInfo, TransactionType } from 'state/transactions/types'

export function useDepositLQDRCallback(amountIn: string): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, provider } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const CLQDRContract = useCLQDRContract()
  const shares = useCalcSharesFromAmount(amountIn)

  const constructCall = useCallback(() => {
    try {
      if (!account || !provider || !CLQDRContract) {
        throw new Error('Missing dependencies.')
      }

      const amountInBN = toBN(amountIn).times(1e18).toFixed(0)
      const args = [amountInBN, shares]
      return {
        address: CLQDRContract.address,
        calldata: CLQDRContract.interface.encodeFunctionData('deposit', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, provider, CLQDRContract, amountIn, shares])

  return useMemo(() => {
    if (!account || !chainId || !provider || !CLQDRContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const summary = `Minting ${toBN(shares).div(1e18).toFixed()} cLQDR by ${amountIn} LQDR`
    const txInfo = {
      type: TransactionType.MINT,
    } as MintTransactionInfo

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback('deposit', constructCall, addTransaction, txInfo, account, provider, summary),
    }
  }, [account, chainId, provider, shares, CLQDRContract, amountIn, constructCall, addTransaction])
}
