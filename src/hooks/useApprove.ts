import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency } from '@uniswap/sdk-core'

import { createTransactionCallback, TransactionCallbackState } from 'utils/web3'

import { useExpertMode } from 'state/user/hooks'
import { useTransactionAdder, useHasPendingApproval } from 'state/transactions/hooks'
import { TransactionType, ApproveTransactionInfo } from 'state/transactions/types'

import { useERC20Contract } from 'hooks/useContract'
import { useApprovalStateForSpender, ApprovalState } from 'lib/hooks/useApproval'

export function useApprove(
  currency?: Currency,
  amountToApprove?: BigNumber.Value,
  spender?: string
): {
  state: TransactionCallbackState
  approvalState: ApprovalState
  callback: null | (() => Promise<string>)
  error: string | null
  summary: string | null
} {
  const { account, chainId, provider } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const userExpertMode = useExpertMode()
  const methodName = 'approve'
  const token = currency?.isToken ? currency.wrapped : undefined
  const Contract = useERC20Contract(token?.address)
  const approvalState = useApprovalStateForSpender(currency, amountToApprove, spender, useHasPendingApproval)

  const constructCall = useCallback(() => {
    try {
      if (!account || !Contract || !token || !spender || !methodName) {
        throw new Error('Missing dependencies.')
      }
      const amountToApproveBN = MaxUint256.toString()

      const args = [spender, amountToApproveBN]
      return {
        address: Contract.address,
        calldata: Contract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, Contract, token, methodName, spender])

  return useMemo(() => {
    if (!account || !chainId || !provider || !Contract || !spender || !methodName) {
      return {
        state: TransactionCallbackState.INVALID,
        approvalState,
        callback: null,
        error: 'Missing dependencies',
        summary: '',
      }
    }

    //TODO: use correct summary for each request type
    const summary = `Approve ${token?.symbol}`
    const txInfo = {
      type: TransactionType.APPROVAL,
      tokenAddress: token?.address,
      spender,
    } as ApproveTransactionInfo

    return {
      state: TransactionCallbackState.VALID,
      approvalState,
      error: null,
      summary,
      callback: () =>
        createTransactionCallback(
          methodName,
          constructCall,
          addTransaction,
          txInfo,
          account,
          provider,
          summary,
          userExpertMode
        ),
    }
  }, [
    spender,
    token,
    methodName,
    approvalState,
    Contract,
    constructCall,
    addTransaction,
    account,
    chainId,
    provider,
    userExpertMode,
  ])
}
