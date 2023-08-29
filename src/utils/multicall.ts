import BigNumber from 'bignumber.js'
import { Contract } from '@ethersproject/contracts'
import { CallState } from '@uniswap/redux-multicall'
import { toBN } from 'utils/numbers'

export function getMultipleBN(result: CallState | undefined): BigNumber[] {
  if (!result || !result.result) {
    return []
  }
  return result.result.map((r) => toBN(r.toString()))
}

export function getSingleBN(result: CallState | undefined, index?: number): BigNumber | null {
  return result && result.result ? toBN(result.result[index || 0].toString()) : null
}

export function getSingleResult<T>(result: CallState, index?: number): T | null {
  return result && result.result ? result.result[index || 0] : null
}

type MethodArg = string | number | BigNumber
export type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined

export function toCallsData(
  contract: Contract | null | undefined,
  callsData?: {
    methodName: string
    callInputs: OptionalMethodInputs
  }[]
): string[] {
  if (!contract || !callsData) return []
  return callsData.map((c) => contract.interface.encodeFunctionData(c.methodName, c.callInputs))
}
