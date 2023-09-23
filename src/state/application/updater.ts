import { useCallback, useEffect, useState } from 'react'
import { Block } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state'

import useIsWindowVisible from 'lib/hooks/useIsWindowVisible'
import useDebounce from 'lib/hooks/useDebounce'
import { SupportedChainId } from 'constants/chains'
// import { useTokenId } from 'state/application/hooks'

import { updateBlockNumber, updateBlockTimestamp, updateChainId, updateAverageBlockTime } from './actions'
// import { useSeTTokenId } from './hooks'
import { toBN } from 'utils/numbers'
// import { useBiggestNFTTokenId } from 'hooks/useVeRam'
// import { useGetVeRamById, useGetVeRams } from 'state/veram/hooks'

export default function Updater(): null {
  const { provider, chainId } = useWeb3React()
  const dispatch = useAppDispatch()

  const windowVisible = useIsWindowVisible()
  // const { loading } = useGetVeRams()
  // const setTokenId = useSeTTokenId()
  // const tokenId = useTokenId()
  // const { tokenId: bigId } = useBiggestNFTTokenId()
  // const isOwnerVeRam = useGetVeRamById(tokenId ?? undefined) ? true : false

  const [blockTimestampBefore, setBlockTimestampBefore] = useState<number | null>(null)
  const BlockLength = 20_000

  const [state, setState] = useState<{
    chainId: number | undefined
    blockNumber: number | null
    blockTimestamp: number | null
  }>({
    chainId,
    blockNumber: null,
    blockTimestamp: null,
  })

  const blockCallback = useCallback(
    (block: Block) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number' && typeof state.blockTimestamp !== 'number') {
            return { chainId, blockNumber: block.number, blockTimestamp: block.timestamp }
          }
          return {
            chainId,
            blockNumber: Math.max(block.number, state.blockNumber ?? 0),
            blockTimestamp: Math.max(block.timestamp, state.blockTimestamp ?? 0),
          }
        }
        return state
      })
    },
    [chainId, setState]
  )

  const onBlock = useCallback(
    (number) => provider && provider.getBlock(number).then(blockCallback),
    [blockCallback, provider]
  )

  // Attach/detach listeners
  useEffect(() => {
    if (!provider || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null, blockTimestamp: null })

    provider
      .getBlock('latest')
      .then(blockCallback)
      .catch((error) => console.error(`Failed to get block for chainId: ${chainId}`, error))

    provider.on('block', onBlock)
    return () => {
      provider.removeListener('block', onBlock)
    }
  }, [dispatch, chainId, provider, windowVisible, blockCallback, onBlock])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockTimestamp || !windowVisible) return
    dispatch(updateBlockTimestamp({ chainId: debouncedState.chainId, blockTimestamp: debouncedState.blockTimestamp }))
  }, [windowVisible, dispatch, debouncedState.blockTimestamp, debouncedState.chainId])

  //getting blockTimeStamp at - 20_000th
  useEffect(() => {
    if (!provider || !chainId || !windowVisible) return undefined

    if (state.blockNumber && state.blockNumber > 0) {
      provider
        .getBlock(state.blockNumber - 20_000)
        .then((block) => {
          setBlockTimestampBefore(block.timestamp)
        })
        .catch((error) => console.error(`Failed to get block for chainId: ${chainId}`, error))
    }
  }, [dispatch, chainId, provider, windowVisible, state.blockNumber])

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockTimestamp || !windowVisible || !blockTimestampBefore) return
    dispatch(
      updateAverageBlockTime({
        chainId: debouncedState.chainId,
        averageBlockTime: toBN(debouncedState.blockTimestamp).minus(blockTimestampBefore).div(BlockLength).toNumber(),
      })
    )
  }, [windowVisible, dispatch, debouncedState.blockTimestamp, debouncedState.chainId, blockTimestampBefore])

  useEffect(() => {
    dispatch(
      updateChainId({ chainId: debouncedState.chainId in SupportedChainId ? debouncedState.chainId ?? null : null })
    )
  }, [dispatch, debouncedState.chainId])

  // useEffect(() => {
  //   if (bigId && !loading && !isOwnerVeRam) {
  //     setTokenId(bigId)
  //   }
  // }, [setTokenId, bigId, loading, tokenId, isOwnerVeRam])

  // useEffect(() => {
  //   setTokenId(null)
  // }, [account, loading, setTokenId])

  return null
}
