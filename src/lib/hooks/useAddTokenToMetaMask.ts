import { useCallback, useState } from 'react'
import { Currency, Token } from '@uniswap/sdk-core'

import { useWeb3React } from '@web3-react/core'
import useCurrencyLogo from './useCurrencyLogo'

export default function useAddTokenToMetaMask(currencyToAdd: Currency | undefined): {
  addToken: () => void
  success: boolean | undefined
} {
  const { connector } = useWeb3React()
  const token: Token | undefined = currencyToAdd?.wrapped
  const logoURL = useCurrencyLogo(token?.address)

  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (!token?.symbol || !connector.watchAsset) return
    connector
      .watchAsset({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        image: logoURL,
      })
      .then(() => setSuccess(true))
      .catch(() => setSuccess(false))
  }, [connector, logoURL, token])

  return { addToken, success }
}
