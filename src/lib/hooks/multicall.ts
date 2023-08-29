import { Contract } from '@ethersproject/contracts'
import { Interface } from '@ethersproject/abi'
import { useWeb3React } from '@web3-react/core'
import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'

import useBlockNumber from 'lib/hooks/useBlockNumber'
import multicall from 'lib/state/multicall'
import { SkipFirst } from 'types/tuple'

import { toCallsData, OptionalMethodInputs } from 'utils/multicall'
import { useMemo } from 'react'

export type { CallStateResult } from '@uniswap/redux-multicall' // re-export for convenience
export { NEVER_RELOAD } from '@uniswap/redux-multicall' // re-export for convenience

// Create wrappers for hooks so consumers don't need to get latest block themselves
type SkipFirstTwoParams<T extends (...args: any) => any> = SkipFirst<Parameters<T>, 2>

export function useMultipleContractSingleData(
  ...args: SkipFirstTwoParams<typeof multicall.hooks.useMultipleContractSingleData>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useMultipleContractSingleData(chainId, latestBlock, ...args)
}

export function useSingleCallResult(...args: SkipFirstTwoParams<typeof multicall.hooks.useSingleCallResult>) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useSingleCallResult(chainId, latestBlock, ...args)
}

export function useSingleContractMultipleData(
  ...args: SkipFirstTwoParams<typeof multicall.hooks.useSingleContractMultipleData>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useSingleContractMultipleData(chainId, latestBlock, ...args)
}

export function useSingleContractWithCallData(
  ...args: SkipFirstTwoParams<typeof multicall.hooks.useSingleContractWithCallData>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useSingleContractWithCallData(chainId, latestBlock, ...args)
}

export function useSingleContractMultipleMethods(
  contract: Contract | null | undefined,
  callsData?: {
    methodName: string
    callInputs: OptionalMethodInputs
  }[],
  option?: Partial<ListenerOptionsWithGas | undefined>
) {
  const { chainId, latestBlock } = useCallContext()
  const callData = useMemo(() => toCallsData(contract, callsData), [contract, callsData])
  return multicall.hooks.useSingleContractWithCallData(chainId, latestBlock, contract, callData, option)
}

export function useMultipleContractMultipleMethods(
  addresses: (string | undefined)[],
  contractInterfaces: Interface[] | undefined,
  methodNames: string[],
  callInputs?: OptionalMethodInputs,
  options?: Partial<ListenerOptionsWithGas> | undefined
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useMultipleContractMultipleData(
    chainId,
    latestBlock,
    addresses,
    contractInterfaces,
    methodNames,
    callInputs,
    options
  )
}

function useCallContext() {
  const { chainId } = useWeb3React()
  const latestBlock = useBlockNumber()
  return { chainId, latestBlock }
}
