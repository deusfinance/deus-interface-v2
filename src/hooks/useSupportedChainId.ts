import { useMemo } from 'react'
import { MIGRATION_CHAIN_IDS, APP_CHAIN_IDS, BRIDGE_CHAIN_IDS } from 'constants/chains'
import { useRouter } from 'next/router'
import { useWeb3React } from '@web3-react/core'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()

  return useMemo(() => {
    if (!chainId || !account) return false
    else if (router.route.includes('/migration')) return MIGRATION_CHAIN_IDS.includes(chainId)
    else if (router.route.includes('/bridge')) return BRIDGE_CHAIN_IDS.includes(chainId)
    return APP_CHAIN_IDS.includes(chainId)
  }, [chainId, account, router.route])
}
