import { useCallback } from 'react'

import useWeb3React from './useWeb3'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'

export default function useRpcChangerCallback() {
  const { account, chainId, library } = useWeb3React()

  return useCallback(
    async (targetChainId: SupportedChainId) => {
      if (!chainId) return false
      if (!targetChainId || !ChainInfo[targetChainId]) return false
      if (targetChainId === chainId) return true
      if (!window.ethereum) return false

      try {
        await library?.send('wallet_switchEthereumChain', [{ chainId: ChainInfo[targetChainId].chainId }])
        return true
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            const params = {
              chainId: ChainInfo[targetChainId].chainId,
              chainName: ChainInfo[targetChainId].chainName,
              nativeCurrency: ChainInfo[targetChainId].nativeCurrency,
              rpcUrls: [ChainInfo[targetChainId].rpcUrl],
            }
            await library?.send('wallet_addEthereumChain', [params, account])
            return true
          } catch (addError) {
            console.log('Something went wrong trying to add a new  network RPC: ')
            console.error(addError)
            return false
          }
        }
        // handle other "switch" errors
        console.log('Unknown error occurred when trying to change the network RPC: ')
        console.error(switchError)
        return false
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [chainId, library, account]
  )
}
