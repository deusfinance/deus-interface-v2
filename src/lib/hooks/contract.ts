import { useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'

import { getContract } from 'utils/web3'
// import { SupportedChainId } from 'constants/chains'
// import { RPC_PROVIDERS } from 'constants/providers'

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | null | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address || address === AddressZero) return null
    try {
      return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

// export function useArbitrumContract<T extends Contract = Contract>(
//   addressOrAddressMap: string | { [chainId: number]: string } | null | undefined,
//   ABI: any
// ): T | null {
//   const { chainId } = useWeb3React()
//   const isArbitrumChain = chainId === SupportedChainId.ARBITRUM
//   const contract = useContract(isArbitrumChain ? addressOrAddressMap : undefined, ABI)

//   return useMemo(() => {
//     if (isArbitrumChain) return contract
//     if (!addressOrAddressMap || !ABI || !chainId) return null
//     let address: string | undefined
//     if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
//     else address = addressOrAddressMap[chainId]
//     if (!address || address === AddressZero) return null
//     const arbProvider = RPC_PROVIDERS[SupportedChainId.ARBITRUM]

//     try {
//       return getContract(address, ABI, arbProvider)
//     } catch (error) {
//       console.error('Failed to get contract', error)
//       return null
//     }
//   }, [isArbitrumChain, contract, addressOrAddressMap, ABI, chainId]) as T
// }
