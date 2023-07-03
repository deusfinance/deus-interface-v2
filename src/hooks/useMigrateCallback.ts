import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useMigratorContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
// import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'
import { MigrationType } from 'components/App/Migrate/Table'
import { DEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useMigrateCallback(
  inputCurrency: (Currency | undefined)[],
  inputAmount: CurrencyAmount<NativeCurrency | Token>[] | null | undefined,
  outputTokens: Currency[]
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migrationType = useMemo(() => {
    if (outputTokens?.length === 1 && outputTokens[0]?.symbol === DEUS_TOKEN?.name) return MigrationType.DEUS
    else if (outputTokens?.length === 1 && outputTokens[0]?.symbol === SYMM_TOKEN?.name) return MigrationType.SYMM
    else if (outputTokens?.length === 2) return MigrationType.BALANCED
  }, [outputTokens])

  const migratorContract = useMigratorContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !migratorContract || !inputAmount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'deposit'

      const tokens = inputCurrency.map((token) => {
        return token?.wrapped?.address
      })

      const amounts = inputAmount.map((amount) => {
        return amount.quotient.toString()
      })

      const len = inputCurrency.length
      let pref = []

      if (migrationType === MigrationType.BALANCED) {
        pref = Array(len).fill(0)
      } else if (migrationType === MigrationType.DEUS) {
        pref = Array(len).fill(1)
      } else {
        pref = Array(len).fill(2)
      }
      const args = [tokens, amounts, pref, account]
      console.log(args)

      return {
        address: migratorContract.address,
        calldata: migratorContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, migratorContract, inputAmount, inputCurrency, migrationType])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract || !inputCurrency) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!inputAmount) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onMigrate(): Promise<string> {
        console.log('onMigrate callback')
        const call = constructCall()
        const { address, calldata, value } = call

        if ('error' in call) {
          console.error(call.error)
          if (call.error.message) {
            throw new Error(call.error.message)
          } else {
            throw new Error('Unexpected error. Could not construct calldata.')
          }
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('MIGRATE TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              toast.error(DefaultHandlerError(callError))
              return {
                error: new Error(callError.message), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
        }

        return library
          .getSigner()
          .sendTransaction({
            ...tx,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)
            const summary = 'Migrated Successfully'
            // migrationType === MigrationType.BALANCED
            //   ? 'Balanced Migrated'
            //   : migrationType === MigrationType.DEUS
            //   ? 'Migrated to DEUS'
            //   : 'Migrated to SYMM'
            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [account, chainId, library, migratorContract, inputCurrency, inputAmount, constructCall, addTransaction])
}
