import { useMemo } from 'react'
import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { nativeOnChain } from 'utils/token'

export default function useNativeCurrency(): NativeCurrency | Token {
  const { chainId } = useWeb3React()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display arbitrum when not connected
          nativeOnChain(FALLBACK_CHAIN_ID),
    [chainId]
  )
}
