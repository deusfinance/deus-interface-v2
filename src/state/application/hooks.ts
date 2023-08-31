import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import { AppState, useAppDispatch, useAppSelector } from 'state'
import { addPopup, removePopup, setOpenModal, updatePositionId, updateTokenId } from './actions'
import { ApplicationState, ApplicationModal, Popup, PopupContent, PopupList } from './reducer'

export function useApplicationState(): ApplicationState {
  return useAppSelector((state) => state.application)
}

export function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3React()
  return useAppSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useBlockTimestamp(): number | undefined {
  const { chainId } = useWeb3React()
  return useAppSelector((state: AppState) => state.application.blockTimestamp[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useToggleWalletModal(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useVeModalToggle(): () => void {
  return useToggleModal(ApplicationModal.VE)
}

export function usePositionModalToggle(): () => void {
  return useToggleModal(ApplicationModal.POSITION)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string, removeAfterMs?: number) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(addPopup({ content, key, removeAfterMs: removeAfterMs ?? DEFAULT_TXN_DISMISS_MS }))
    },
    [dispatch]
  )
}
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

export function useActivePopups(): PopupList {
  const list = useAppSelector((state: AppState) => {
    return state.application.popupList
  })
  return useMemo(() => list.filter((item: Popup) => item.show), [list])
}

//global TokenId for veModal
export function useTokenId(): number | null {
  const { tokenId } = useApplicationState()
  return useMemo(() => tokenId, [tokenId])
}

export function useSeTTokenId() {
  const dispatch = useAppDispatch()
  return useCallback(
    (tokenId: number | null) => {
      dispatch(updateTokenId(tokenId))
    },
    [dispatch]
  )
}

export function usePositionId(): number | null {
  const { positionId } = useApplicationState()
  return useMemo(() => positionId, [positionId])
}

export function useSeTPositionId() {
  const dispatch = useAppDispatch()
  return useCallback(
    (positionId: number | null) => {
      dispatch(updatePositionId(positionId))
    },
    [dispatch]
  )
}
