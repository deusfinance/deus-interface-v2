import { useCallback, useState } from 'react'
import { Currency, Token } from '@uniswap/sdk-core'

import { useWeb3React } from '@web3-react/core'

export default function useAddTokenToMetaMask(currencyToAdd: Currency | undefined): {
  addToken: () => void
  success: boolean | undefined
} {
  const { provider } = useWeb3React()
  const token: Token | undefined = currencyToAdd?.wrapped
  const [success, setSuccess] = useState<boolean | undefined>()

  const addToken = useCallback(() => {
    if (provider && provider.provider.isMetaMask && provider.provider.request && token) {
      provider.provider
        .request({
          method: 'wallet_watchAsset',
          params: {
            // @ts-ignore // need this for incorrect ethers provider type
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          },
        })
        .then((success) => {
          setSuccess(success)
        })
        .catch(() => setSuccess(false))
    } else {
      setSuccess(false)
    }
  }, [provider, token])

  return { addToken, success }
}
