import { useMemo } from 'react'
import { Token, Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import { getCombinedTokens } from 'utils/token'
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from './useCurrency'
import { AddressMap } from 'utils/address'
import { TokenMap } from 'utils/token'
import { useAllTokensData } from 'state/api/hooks'

export function useDefaultTokens(): TokenMap {
  const { chainId } = useWeb3React()
  return useMemo(() => {
    if (chainId) {
      const combinedTokens = getCombinedTokens()
      return combinedTokens[chainId] ?? {}
    }
    return {}
  }, [chainId])
}

export function useAllTokens(): TokenMap {
  const defaultTokens = useDefaultTokens()
  const apiTokens = useAllTokensData()
  return useMemo(() => {
    return { ...apiTokens, ...defaultTokens }
  }, [defaultTokens, apiTokens])
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(addressOrAddressMap?: AddressMap | string | null): Token | null | undefined {
  const { chainId } = useWeb3React()

  const tokenAddress = useMemo(() => {
    if (!addressOrAddressMap) {
      return null
    }
    if (typeof addressOrAddressMap === 'string') {
      return addressOrAddressMap
    }
    return addressOrAddressMap[chainId ?? FALLBACK_CHAIN_ID] ?? null
  }, [chainId, addressOrAddressMap])

  return useTokenByAddress(tokenAddress)
}

export function useTokenByAddress(tokenAddress?: string | null): Token | null | undefined {
  const tokens = useAllTokens()
  return useTokenFromMapOrNetwork(tokens, tokenAddress)
}

export function useCurrency(
  addressOrAddressMap?: AddressMap | string | null,
  targetChainId?: SupportedChainId
): Currency | null | undefined {
  const { chainId: connectedChainId } = useWeb3React()
  const chainId = useMemo(() => targetChainId ?? connectedChainId, [connectedChainId, targetChainId])

  const tokenAddress = useMemo(() => {
    if (!addressOrAddressMap || !chainId) {
      return null
    }
    if (typeof addressOrAddressMap === 'string') {
      return addressOrAddressMap
    }
    return addressOrAddressMap[chainId] ?? null
  }, [chainId, addressOrAddressMap])

  return useCurrencyByAddress(tokenAddress)
}

export function useCurrencyByAddress(currencyId?: string | null): Currency | null | undefined {
  const tokens = useAllTokens()
  return useCurrencyFromMap(tokens, currencyId)
}
