import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { RPC_PROVIDERS } from 'constants/providers'
import SID, { getSidAddress } from '@siddomains/sidjs'

export function useSpaceIdOnChain(): string | undefined {
  const { account } = useWeb3React()
  const [domain, setDomain] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchSpaceId = async (account: string) => {
      const chainId = SupportedChainId.ARBITRUM
      const provider = RPC_PROVIDERS[chainId]
      const sid = new SID({ provider, sidAddress: getSidAddress(chainId) })

      try {
        const id = await sid.getName(account)

        return typeof id?.name === 'string' ? id.name : undefined
      } catch (e) {
        console.log('error on fetching from spaceId', e)
        return undefined
      }
    }

    const fetchData = async () => {
      if (!account) {
        setDomain(undefined)
      } else {
        const domain = await fetchSpaceId(account)
        setDomain(domain)
      }
    }

    fetchData()
  }, [account])

  return domain
}
