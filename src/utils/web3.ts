import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { toast } from 'react-hot-toast'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import type { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { isAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'

import { TransactionInfo } from 'state/transactions/types'
import { DefaultHandlerError } from 'utils/parseError'

//TODO: remove import { BigNumber } from '@ethersproject/bignumber'

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

function getSigner(provider: JsonRpcProvider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked()
}

// account is optional
function getProviderOrSigner(provider: JsonRpcProvider, account?: string): JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(provider, account) : provider
}

// account is optional
export function getContract(address: string, ABI: any, provider: JsonRpcProvider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(provider, account) as any)
}

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

//general callback function for sending transaction to wallet providers
export async function createTransactionCallback(
  methodName: string,
  constructCall: () =>
    | { address: string; calldata: string; value: number | BN; error?: undefined }
    | { address?: undefined; calldata?: undefined; value?: undefined; error: any }
    | Promise<any>,
  addTransaction: any,
  txInfo: TransactionInfo,
  account: undefined | null | string,
  provider: any,
  summary?: string,
  expertMode?: boolean | null
) {
  console.log(`on${methodName.charAt(0).toUpperCase() + methodName.slice(1)} Callback`)
  const call = await constructCall()
  const { address, calldata, value } = call

  if ('error' in call) {
    if (call.error.message) {
      throw new Error(call.error.message)
    } else {
      throw new Error('Unexpected error. Could not construct calldata.')
    }
  }

  const tx = !value
    ? { from: account, to: address, data: calldata }
    : { from: account, to: address, data: calldata, value: BigNumber.from(value.toString()) }

  console.log(methodName.toUpperCase() + ' TRANSACTION', { tx, value })
  let estimatedGas = await provider.estimateGas(tx).catch((gasError: any) => {
    console.debug('Gas estimate failed, trying eth_call to extract error', call)

    return provider
      .call(tx)
      .then((result: any) => {
        if (gasError.reason) toast.error(DefaultHandlerError(gasError))
        console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
        return {
          error: new Error('Unexpected issue with estimating the gas. Please try again.'),
        }
      })
      .catch((callError: any) => {
        console.debug('Call threw an error', call, callError)
        toast.error(DefaultHandlerError(callError))
        return {
          error: new Error(callError.message),
        }
      })
  })

  if ('error' in estimatedGas) {
    if (expertMode) {
      estimatedGas = BigNumber.from(500_000)
    } else {
      return console.log('Unexpected error. Could not estimate gas for this transaction.')
      //TODO
      throw new Error('Unexpected error. Could not estimate gas for this transaction.')
    }
  }

  return provider
    .getSigner()
    .sendTransaction({
      ...tx,
      ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
      // gasPrice /// TODO add gasPrice based on EIP 1559
    })
    .then((response: TransactionResponse) => {
      addTransaction(response, txInfo, summary)

      return response.hash
    })
    .catch((error: any) => {
      // if the user rejected the tx, pass this along
      if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
        toast.error('Transaction rejected.')
        // throw new Error('Transaction rejected.')
      } else {
        // otherwise, the error was unexpected and we need to convey that
        console.error(`Transaction failed`, error, address, calldata, value)
        // toast.error(`Transaction failed: ${error.message}`)
        // throw new Error(`Transaction failed: ${error.message}`)
      }
    })
}
