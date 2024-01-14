/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeusConversionContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'
import { XDEUS_TOKEN } from 'constants/tokens'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export function useInitiateTokenConversionCallback(
  inputCurrency: Currency,
  inputAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const deusConversionContract = useDeusConversionContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !deusConversionContract) {
        throw new Error('Missing dependencies.')
      }

      const methodName =
        inputCurrency?.symbol === XDEUS_TOKEN?.symbol ? 'initiateXDeusConversion' : 'initiateLegacyDeusConversion'
      const args = [inputAmount ? toHex(inputAmount.quotient) : 0]

      return {
        address: deusConversionContract.address,
        calldata: deusConversionContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, deusConversionContract, inputCurrency?.symbol, inputAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !deusConversionContract || !inputCurrency) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onInitiateTokenConversion(): Promise<string> {
        console.log('onInitiateTokenConversion callback')
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

        console.log('InitiateTokenConversion TRANSACTION', { tx, value })

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
            const summary = `Initiate ${inputAmount ? inputAmount?.toSignificant() : 0} ${
              inputCurrency?.symbol
            } conversion to DEUS`
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
  }, [account, chainId, library, deusConversionContract, inputCurrency, constructCall, inputAmount, addTransaction])
}

export function useClaimTokenConversionCallback(inputCurrency: Currency): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const deusConversionContract = useDeusConversionContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !deusConversionContract) {
        throw new Error('Missing dependencies.')
      }

      const methodName =
        inputCurrency?.symbol === XDEUS_TOKEN?.symbol ? 'claimXDeusConversion' : 'claimLegacyDeusConversion'

      return {
        address: deusConversionContract.address,
        calldata: deusConversionContract.interface.encodeFunctionData(methodName, []) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, deusConversionContract, inputCurrency?.symbol])

  return useMemo(() => {
    if (!account || !chainId || !library || !deusConversionContract || !inputCurrency) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onClaimTokenConversion(): Promise<string> {
        console.log('onClaimTokenConversion callback')
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

        console.log('ClaimTokenConversion TRANSACTION', { tx, value })

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
            const summary = `Claim ${inputCurrency?.symbol}`
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
  }, [account, chainId, library, deusConversionContract, inputCurrency, constructCall, addTransaction])
}
