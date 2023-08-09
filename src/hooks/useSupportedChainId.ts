import { useMemo } from 'react'
import useWeb3React from './useWeb3'
import { BridgeChains, MigrationChains, SolidlyChains } from 'constants/chains'
import { useRouter } from 'next/router'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()

  return useMemo(() => {
    if (!chainId || !account) return false
    else if (router.route.includes('/migration')) return MigrationChains.includes(chainId)
    else if (router.route.includes('/bridge')) return BridgeChains.includes(chainId)
    return SolidlyChains.includes(chainId)
  }, [chainId, account, router.route])
}
