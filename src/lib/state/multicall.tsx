import { useEffect, useMemo, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Call,
  CallResult,
  CallStateResult,
  createMulticall,
  DEFAULT_BLOCKS_PER_FETCH,
  INVALID_CALL_STATE,
  INVALID_RESULT,
  ListenerOptions,
  LOADING_CALL_STATE,
  WithMulticallState,
} from '@uniswap/redux-multicall'

import { SupportedChainId } from 'constants/chains'

import { useMultiCall3Contract } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'
import { CallState } from '@uniswap/redux-multicall'
import { Interface, FunctionFragment } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { OptionalMethodInputs } from 'utils/multicall'
import { useDispatch, useSelector } from 'react-redux'
import { MulticallContext } from '@uniswap/redux-multicall/dist/context'
import { MethodArgs, MethodArg } from '@uniswap/redux-multicall/dist/validation'

const uniMulticall = createMulticall()

type UniMulticall = typeof uniMulticall

export interface Multicall extends UniMulticall {
  hooks: UniMulticall['hooks'] & {
    useMultipleContractMultipleData: (
      chainId: number | undefined,
      latestBlockNumber: number | undefined,
      addresses: (string | undefined)[],
      contractInterfaces: Interface[] | undefined,
      methodNames: string[],
      callInputs?: OptionalMethodInputs,
      options?: Partial<ListenerOptionsWithGas> | undefined
    ) => CallState[]
  }
}
const multicall = uniMulticall as Multicall

const context = { reducerPath: multicall.reducerPath, actions: multicall.actions }

multicall.hooks.useMultipleContractMultipleData = useMultipleContractMultipleData

function useMultipleContractMultipleData(
  chainId: number | undefined,
  latestBlockNumber: number | undefined,
  addresses: (string | undefined)[],
  contractInterfaces: Interface[] | undefined,
  methodNames: string[],
  callInputs?: OptionalMethodInputs,
  options?: Partial<ListenerOptionsWithGas>
): CallState[] {
  const { gasRequired } = options ?? {}

  // Get encoded call data. Note can't use useCallData below b.c. this is  for a list of CallInputs
  const fragments = useMemo(() => {
    if (!addresses || !contractInterfaces || !callInputs) return []
    return methodNames.map<FunctionFragment | undefined>((methodName, i) => {
      return contractInterfaces[i]?.getFunction(methodName)
    })
  }, [callInputs, addresses, contractInterfaces, methodNames])

  const callDatas = useMemo(() => {
    if (!addresses || !contractInterfaces || !callInputs) return []
    return callInputs.map<string | undefined>((callInput, i) => {
      return isValidMethodArgs(callInput) && fragments[i]
        ? contractInterfaces[i].encodeFunctionData(fragments[i] as FunctionFragment, callInputs[i] as MethodArgs)
        : undefined
    })
  }, [callInputs, addresses, contractInterfaces, fragments])

  // Create call objects
  const calls = useMemo(() => {
    if (!callDatas) return []
    return addresses.map<Call | undefined>((address, i) => {
      if (!address || !callDatas[i]) return undefined
      return { address, callData: callDatas[i] as string, gasRequired }
    })
  }, [addresses, callDatas, gasRequired])

  // Subscribe to call data
  const results = useCallsDataSubscription(context, chainId, calls, options as ListenerOptions)
  return useCallStates(results, contractInterfaces, fragments as FunctionFragment[], latestBlockNumber)
}

export default multicall

function getBlocksPerFetchForChainId(chainId: number | undefined): number {
  switch (chainId) {
    case SupportedChainId.ARBITRUM:
      return 10
    default:
      return 1
  }
}

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()
  const contract = useMultiCall3Contract()
  const listenerOptions: ListenerOptions = useMemo(
    () => ({
      blocksPerFetch: getBlocksPerFetchForChainId(chainId),
    }),
    [chainId]
  )
  return (
    <multicall.Updater
      chainId={chainId}
      latestBlockNumber={latestBlockNumber}
      contract={contract}
      listenerOptions={listenerOptions}
    />
  )
}

function useCallsDataSubscription(
  context: MulticallContext,
  chainId: number | undefined,
  calls: Array<Call | undefined>,
  listenerOptions?: ListenerOptions
): CallResult[] {
  const { reducerPath, actions } = context
  const callResults = useSelector((state: WithMulticallState) => state[reducerPath].callResults)
  const defaultListenerOptions = useSelector((state: WithMulticallState) => state[reducerPath].listenerOptions)
  const dispatch = useDispatch()
  const serializedCallKeys: string = useMemo(() => JSON.stringify(callsToCallKeys(calls)), [calls])

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys)
    const calls = callKeysToCalls(callKeys)
    if (!chainId || !calls) return
    const blocksPerFetchFromState = (defaultListenerOptions ?? {})[chainId]?.blocksPerFetch
    const blocksPerFetchForChain =
      listenerOptions?.blocksPerFetch ?? blocksPerFetchFromState ?? DEFAULT_BLOCKS_PER_FETCH

    dispatch(
      actions.addMulticallListeners({
        chainId,
        calls,
        options: { blocksPerFetch: blocksPerFetchForChain },
      })
    )

    return () => {
      dispatch(
        actions.removeMulticallListeners({
          chainId,
          calls,
          options: { blocksPerFetch: blocksPerFetchForChain },
        })
      )
    }
  }, [actions, chainId, dispatch, listenerOptions, serializedCallKeys, defaultListenerOptions])

  const lastResults = useRef<CallResult[]>([])
  return useMemo(() => {
    let isChanged = lastResults.current.length !== calls.length

    // Construct results using a for-loop to handle sparse arrays.
    // Array.prototype.map would skip empty entries.
    const results: CallResult[] = []
    for (let i = 0; i < calls.length; ++i) {
      const call = calls[i]
      let result = INVALID_RESULT
      if (chainId && call) {
        const callResult = callResults[chainId]?.[toCallKey(call)]
        result = {
          valid: true,
          data: callResult?.data && callResult.data !== '0x' ? callResult.data : undefined,
          blockNumber: callResult?.blockNumber,
        }
      }

      isChanged = isChanged || !areCallResultsEqual(result, lastResults.current[i])
      results.push(result)
    }

    // Force the results to be referentially stable if they have not changed.
    // This is necessary because *all* callResults are passed as deps when initially memoizing the results.
    if (isChanged) {
      lastResults.current = results
    }
    return lastResults.current
  }, [callResults, calls, chainId])
}

function callsToCallKeys(calls?: Array<Call | undefined>) {
  return (
    calls
      ?.filter((c): c is Call => Boolean(c))
      ?.map(toCallKey)
      ?.sort() ?? []
  )
}

function toCallKey(call: Call): string {
  let key = `${call.address}-${call.callData}`
  if (call.gasRequired) {
    if (!Number.isSafeInteger(call.gasRequired)) {
      throw new Error(`Invalid number: ${call.gasRequired}`)
    }
    key += `-${call.gasRequired}`
  }
  return key
}

function areCallResultsEqual(a: CallResult, b: CallResult) {
  return a.valid === b.valid && a.data === b.data && a.blockNumber === b.blockNumber
}

function callKeysToCalls(callKeys: string[]) {
  if (!callKeys?.length) return null
  return callKeys.map((key) => parseCallKey(key))
}

function parseCallKey(callKey: string): Call {
  const pcs = callKey.split('-')
  if (![2, 3].includes(pcs.length)) {
    throw new Error(`Invalid call key: ${callKey}`)
  }
  return {
    address: pcs[0],
    callData: pcs[1],
    ...(pcs[2] ? { gasRequired: Number.parseInt(pcs[2]) } : {}),
  }
}

function useCallStates(
  results: CallResult[],
  contractInterfaces: Interface[] | undefined,
  fragments: ((i: number) => FunctionFragment | undefined) | FunctionFragment[] | undefined,
  latestBlockNumber: number | undefined
): CallState[] {
  // Avoid refreshing the results with every changing block number (eg latestBlockNumber).
  // Instead, only refresh the results if they need to be synced - if there is a result which is stale, for which blockNumber < latestBlockNumber.
  const syncingBlockNumber = useMemo(() => {
    const lowestBlockNumber = results.reduce<number | undefined>(
      (memo, result) => (result.blockNumber ? Math.min(memo ?? result.blockNumber, result.blockNumber) : memo),
      undefined
    )
    return Math.max(lowestBlockNumber ?? 0, latestBlockNumber ?? 0)
  }, [results, latestBlockNumber])

  return useMemo(() => {
    if (!contractInterfaces) {
      return []
    }
    return results.map((result, i) => {
      const resultFragment = typeof fragments === 'function' ? fragments(i) : fragments?.[i]

      return toCallState(result, contractInterfaces[i], resultFragment, syncingBlockNumber)
    })
  }, [contractInterfaces, fragments, results, syncingBlockNumber])
}

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  syncingBlockNumber: number | undefined
): CallState {
  if (!callResult || !callResult.valid) {
    return INVALID_CALL_STATE
  }

  const { data, blockNumber } = callResult
  if (!blockNumber || !contractInterface || !fragment || !syncingBlockNumber) {
    return LOADING_CALL_STATE
  }

  const success = data && data.length > 2
  const syncing = blockNumber < syncingBlockNumber
  let result: CallStateResult | undefined = undefined
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data)
    } catch (error) {
      console.debug('Result data parsing failed', fragment, data)
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  }
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}

function isMethodArg(x: unknown): x is MethodArg {
  return BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
}
