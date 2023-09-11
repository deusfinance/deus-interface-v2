import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { MaxUint256 } from '@ethersproject/constants'
import { Token } from '@uniswap/sdk-core'

import { useWeb3React } from '@web3-react/core'

import { usePendingApprovalList, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils/web3'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import ERC20_ABI from 'constants/abi/ERC20.json'
import { Interface } from '@ethersproject/abi'
import { getContract } from 'utils/web3'
import { BN_TEN } from 'utils/numbers'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

// export default function useApproveCallbacks(
//   currencies: Token[],
//   spender: string | undefined
// ): [ApprovalState[], (index: number | null) => Promise<void>] {
//   const { provider, account, chainId } = useWeb3React()

//   const addTransaction = useTransactionAdder()
//   const currenciesAddress = useMemo(() => currencies.map((currency) => currency.address), [currencies])
//   const pendingApproval = usePendingApprovalList(currenciesAddress, spender)

//   const contracts = currencies.map((currency) => currency.address)
//   const allowances = useMultipleContractSingleData(contracts, new Interface(ERC20_ABI), 'allowance', [
//     account ?? undefined,
//     spender,
//   ])

//   const approvalStates = useMemo(() => {
//     return currencies.map((currency, index) => {
//       const currencyResult = allowances[index]?.result

//       if (!currency) return ApprovalState.UNKNOWN
//       if (!spender) return ApprovalState.UNKNOWN
//       if (currency.isNative) return ApprovalState.APPROVED
//       if (!currencyResult?.length) return ApprovalState.UNKNOWN

//       return currencyResult[0].gt(0)
//         ? ApprovalState.APPROVED
//         : pendingApproval
//         ? ApprovalState.PENDING
//         : ApprovalState.NOT_APPROVED
//     })
//   }, [pendingApproval, currencies, spender, allowances])

//   const handleApproveByIndex = useCallback(
//     async (index) => {
//       const approvalState = approvalStates[index]
//       const token = currencies[index]

//       if (!provider) {
//         console.error('library is null')
//         return
//       }

//       const TokenContract = getContract(token.address, ERC20_ABI, provider, account ? account : undefined)

//       if (approvalState === ApprovalState.APPROVED) {
//         console.error('approve was called unnecessarily')
//         return
//       }

//       if (!chainId) {
//         console.error('no chainId')
//         return
//       }

//       if (!TokenContract) {
//         console.error('TokenContract is null')
//         return
//       }

//       if (!account) {
//         console.error('account is null')
//         return
//       }

//       if (!spender) {
//         console.error('no spender')
//         return
//       }

//       const estimatedGas = await TokenContract.estimateGas.approve(spender, MaxUint256)
//       return TokenContract.approve(spender, MaxUint256, {
//         gasLimit: calculateGasMargin(estimatedGas),
//       })
//         .then((response: TransactionResponse) => {
//           addTransaction(response, {
//             summary: 'Approve ' + token?.symbol,
//             approval: { tokenAddress: token?.address, spender },
//           })
//         })
//         .catch((error: Error) => {
//           console.error('Failed to approve token for an unknown reason', error)
//         })
//     },
//     [approvalStates, currencies, provider, account, chainId, spender, addTransaction]
//   )

//   return [approvalStates, handleApproveByIndex]
// }

export function useApproveCallbacksWithAmounts(
  currencies: Token[],
  spender: string | undefined,
  typedAmounts?: string[] | number[] | undefined,
  limitedApprove?: boolean
): [ApprovalState[], (index: number | null) => Promise<void>] {
  const { provider, account, chainId } = useWeb3React()

  const addTransaction = useTransactionAdder()

  const currenciesAddress = useMemo(() => currencies.map((currency) => currency.address), [currencies])
  const pendingApproval = usePendingApprovalList(currenciesAddress, spender)

  const contracts = currencies.map((currency) => currency.address)
  const allowances = useMultipleContractSingleData(contracts, new Interface(ERC20_ABI), 'allowance', [
    account ?? undefined,
    spender,
  ])

  const amountToApprove = useMemo(() => {
    return currencies.map((currency, index) => {
      if (currency && typedAmounts?.[index] && limitedApprove)
        return BN_TEN.pow(currency.decimals).times(typedAmounts[index]).toString()
      return MaxUint256.toString()
    })
  }, [currencies, typedAmounts, limitedApprove])

  const amountToCompare = useMemo(() => {
    return currencies.map((currency, index) => {
      if (currency && typedAmounts?.[index]) return BN_TEN.pow(currency.decimals).times(typedAmounts[index]).toString()
      return '0'
    })
  }, [currencies, typedAmounts])

  const approvalStates = useMemo(() => {
    return currencies.map((currency, index) => {
      const currencyResult = allowances[index]?.result

      if (!currency) return ApprovalState.UNKNOWN
      if (!spender) return ApprovalState.UNKNOWN
      if (currency.isNative) return ApprovalState.APPROVED
      if (!currencyResult?.length) return ApprovalState.UNKNOWN
      if (typedAmounts?.[index] && Number(typedAmounts?.[index]) == 0) return ApprovalState.APPROVED

      return currencyResult[0].gt(0) && currencyResult[0].gte(amountToCompare[index])
        ? ApprovalState.APPROVED
        : pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
    })
  }, [currencies, allowances, spender, typedAmounts, amountToCompare, pendingApproval])

  const handleApproveByIndex = useCallback(
    async (index) => {
      const approvalState = approvalStates[index]
      const token = currencies[index]

      if (!provider) {
        console.error('library is null')
        return
      }

      const TokenContract = getContract(token.address, ERC20_ABI, provider, account ? account : undefined)

      if (approvalState === ApprovalState.APPROVED) {
        console.error('approve was called unnecessarily')
        return
      }

      if (!chainId) {
        console.error('no chainId')
        return
      }

      if (!TokenContract) {
        console.error('TokenContract is null')
        return
      }

      if (!account) {
        console.error('account is null')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      const estimatedGas = await TokenContract.estimateGas.approve(spender, amountToApprove[index])
      return TokenContract.approve(spender, amountToApprove[index], {
        gasLimit: calculateGasMargin(estimatedGas),
      })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + token?.symbol,
            approval: { tokenAddress: token?.address, spender },
          })
        })
        .catch((error: Error) => {
          console.error('Failed to approve token for an unknown reason', error)
        })
    },
    [approvalStates, currencies, provider, account, chainId, spender, amountToApprove, addTransaction]
  )

  return [approvalStates, handleApproveByIndex]
}
