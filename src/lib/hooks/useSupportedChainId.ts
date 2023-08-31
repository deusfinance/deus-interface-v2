import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import { APP_CHAIN_IDS } from 'constants/chains'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  return useMemo(() => {
    if (!chainId || !account) return false
    return APP_CHAIN_IDS.includes(chainId)
  }, [chainId, account])
}
