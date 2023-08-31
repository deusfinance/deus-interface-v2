import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { getConnection } from 'connection/utils'
import { SupportedChainId } from 'constants/chains'
import { addPopup } from 'state/application/actions'
import { useAppDispatch } from 'state'
import { updateConnectionError } from 'state/connection/reducer'
import { switchChain } from 'utils/switchChain'

export default function useSelectChain() {
  const dispatch = useAppDispatch()
  const { connector } = useWeb3React()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      if (!connector) return

      const connectionType = getConnection(connector).type

      try {
        dispatch(updateConnectionError({ connectionType, error: undefined }))
        await switchChain(connector, targetChain)
      } catch (error) {
        console.error('Failed to switch networks', error)

        dispatch(updateConnectionError({ connectionType, error: error.message }))
        dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))
      }
    },
    [connector, dispatch]
  )
}
