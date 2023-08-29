import { useCallback, useMemo } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import type { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useERC20Contract } from 'hooks/useContract'
import { useERC20Allowance } from './useERC20Allowance'
import { calculateGasMargin } from 'utils/web3'
import BigNumber from 'bignumber.js'
import { BN_TEN } from 'utils/numbers'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export function useApprovalStateForSpender(
  currency: Currency | undefined,
  amountToApprove: BigNumber.Value | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const { account } = useWeb3React()
  const token = currency?.isToken ? currency.wrapped : undefined

  const { tokenAllowance } = useERC20Allowance(token, account ?? undefined, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (!currency) return ApprovalState.UNKNOWN
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if tokenAllowance is
    return tokenAllowance.lt(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [currency, amountToApprove, pendingApproval, spender, tokenAllowance])
}

export function useApproval(
  currency: Currency | undefined,
  amountToApprove: BigNumber.Value | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
  ApprovalState,
  () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
] {
  const { chainId } = useWeb3React()
  const token = currency?.isToken ? currency.wrapped : undefined

  // check the current approval status
  const approvalState = useApprovalStateForSpender(currency, amountToApprove, spender, useIsPendingApproval)

  const tokenContract = useERC20Contract(token?.address)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    const amountToApproveBN = BN_TEN.pow(token.decimals).times(amountToApprove).toString()

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApproveBN)
    })

    return tokenContract
      .approve(spender, useExact ? amountToApproveBN : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response: TransactionResponse) => {
        return {
          response,
          tokenAddress: token.address,
          spenderAddress: spender,
        }
      })
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, chainId])

  return [approvalState, approve]
}
