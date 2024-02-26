import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useClaimDeusContract, useMigratorContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { DefaultHandlerError } from 'utils/parseError'
import { MigrationType } from 'components/App/Migrate/Table'
import { DEUS_TOKEN, SYMM_TOKEN, XDEUS_TOKEN } from 'constants/tokens'
import { toHex } from 'utils/hex'
import { INFO_URL } from 'constants/misc'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useDepositCallback(
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

      let index = amounts.indexOf('0')
      while (index > -1) {
        amounts.splice(index, 1)
        tokens.splice(index, 1)
        pref.splice(index, 1)
        index = amounts.indexOf('0')
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

export function useSignMessage(message: string): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()

  const migratorContract = useMigratorContract()

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!message) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'No message provided',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onMigrate(): Promise<string> {
        console.log('onSign callback')

        return library
          .getSigner()
          .signMessage(message)
          .then((response) => {
            console.log(response)
            return response
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              // console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [account, chainId, library, migratorContract, message])
}

export function useUndoCallback(index: number): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migratorContract = useMigratorContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !migratorContract) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'undo'
      const args = [index]
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
  }, [account, library, migratorContract, index])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
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

        console.log('UNDO MIGRATE TRANSACTION', { tx, value })

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
            const summary = 'Undo the migration Successfully'
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
  }, [account, chainId, library, migratorContract, constructCall, addTransaction])
}

export function useSplitCallback(
  index: number,
  inputAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migratorContract = useMigratorContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !migratorContract || !inputAmount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'split'
      const args = [index, toHex(inputAmount.quotient)]
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
  }, [account, library, migratorContract, inputAmount, index])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract) {
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

        console.log('SPLIT MIGRATE TRANSACTION', { tx, value })

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
            const summary = 'Splitted Successfully'
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
  }, [account, chainId, library, migratorContract, inputAmount, constructCall, addTransaction])
}

export function useTransferCallback(
  index: number,
  address: string
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migratorContract = useMigratorContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !migratorContract || !address) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'transfer'
      const args = [index, address]
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
  }, [account, library, migratorContract, address, index])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!address) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'No address provided',
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

        console.log('TRANSFER MIGRATE TRANSACTION', { tx, value })

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
            const summary = 'Transferred Successfully'
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
  }, [account, chainId, library, migratorContract, address, constructCall, addTransaction])
}

export function useChangePreferenceCallback(
  index: number,
  newPreference: number
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migratorContract = useMigratorContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !migratorContract) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'changePreference'
      const args = [index, newPreference]
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
  }, [account, library, migratorContract, newPreference, index])

  return useMemo(() => {
    if (!account || !chainId || !library || !migratorContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    // if (!newPreference) {
    //   return {
    //     state: TransactionCallbackState.INVALID,
    //     callback: null,
    //     error: 'No new preference provided',
    //   }
    // }

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

        console.log('CHANGE_PREFERENCE MIGRATE TRANSACTION', { tx, value })

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
            const summary = 'Changed Preference Successfully'
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
  }, [account, chainId, library, migratorContract, constructCall, addTransaction])
}

export function useClaimCallback(
  inputCurrency: Currency | undefined,
  inputAmount: number,
  index: number
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const migratorContract = useMigratorContract()

  //it should get proof data from the api
  const getProofData = useCallback(async () => {
    try {
      const { href: url } = new URL(`/symm/proofs/${account}/`, INFO_URL)
      return makeHttpRequest(url)
    } catch (err) {
      throw err
    }
  }, [account])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !library || !migratorContract || !inputAmount) {
        throw new Error('Missing dependencies.')
      }

      const proofResponse = await getProofData()
      const bdei_amount = proofResponse['bdei_amount']
      const bdei_proof = proofResponse['bdei_proof']
      const legacy_dei_proof = proofResponse['legacy_dei_proof']
      const legacy_dei_amount = proofResponse['legacy_dei_amount']
      // console.log({ bdei_proof, bdei_amount, legacy_dei_amount, legacy_dei_proof })

      let methodName = ''
      let args: any = []

      if (inputCurrency?.symbol === XDEUS_TOKEN?.symbol) {
        methodName = 'convertXDEUS'
        args = [inputAmount]
      } else if (inputCurrency?.symbol === 'LegacyDEI') {
        methodName = 'convertLegacyDEI'
        args = [inputAmount, legacy_dei_amount, legacy_dei_proof]
      } else if (inputCurrency?.symbol === 'bDEI') {
        methodName = 'convertBDEI'
        args = [inputAmount, bdei_amount, bdei_proof]
      }
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
  }, [account, library, migratorContract, inputAmount, getProofData, inputCurrency?.symbol])

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
        const { address, calldata, value } = await call

        // // @ts-ignore
        // if ('error' in call) {
        //   // @ts-ignore
        //   console.error(call.error)
        //   // @ts-ignore
        //   if (call.error.message) {
        //     // @ts-ignore
        //     throw new Error(call.error.message)
        //   } else {
        //     throw new Error('Unexpected error. Could not construct calldata.')
        //   }
        // }

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
            const summary = 'Claimed Successfully'
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

export function useClaimDeusCallback(
  claimable_deus_amount: string,
  proof: any
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const claimDeusContract = useClaimDeusContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !claimDeusContract) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'claim'
      const args = [toBN(claimable_deus_amount).toString(), proof]
      console.log(args)

      return {
        address: claimDeusContract.address,
        calldata: claimDeusContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, claimDeusContract, claimable_deus_amount, proof])

  return useMemo(() => {
    if (!account || !chainId || !library || !claimDeusContract || !claimable_deus_amount || !proof) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onMigrate(): Promise<string> {
        console.log('onMigrate callback')
        const call = constructCall()
        const { address, calldata, value } = await call

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
            const summary = 'Claimed Successfully'
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
  }, [account, chainId, library, claimDeusContract, claimable_deus_amount, proof, constructCall, addTransaction])
}
