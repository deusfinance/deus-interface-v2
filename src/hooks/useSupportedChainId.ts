import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { MIGRATION_CHAIN_IDS, APP_CHAIN_IDS } from 'constants/chains'
import { useRouter } from 'next/router'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()

  return useMemo(() => {
    if (!chainId || !account) return false
    else if (router.route.includes('/migration')) return MIGRATION_CHAIN_IDS.includes(chainId)
    return APP_CHAIN_IDS.includes(chainId)
  }, [chainId, account, router.route])
}
