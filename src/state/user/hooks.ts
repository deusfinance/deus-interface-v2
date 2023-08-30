import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@uniswap/sdk-core'
import { useAppDispatch, useAppSelector } from 'state'

import { initialState, UserState } from './reducer'
import { updateUserSlippageTolerance, updateUserDarkMode, updateItemsPerPage, addSerializedToken } from './actions'
import { SerializedToken, UserAddedToken } from 'types/token'

import { deserializeToken, serializeToken } from 'utils/token'

export function useUserState(): UserState {
  return useAppSelector((state) => state.user)
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )
  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useSetSlippageToleranceCallback(): (slippageTolerance: number) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (userSlippageTolerance) => {
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance,
        })
      )
    },
    [dispatch]
  )
}

export function useSetItemsPerPageCallback(): (itemPerPage: number) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (userItemsPerPage: number) => {
      dispatch(
        updateItemsPerPage({
          userItemsPerPage,
        })
      )
    },
    [dispatch]
  )
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

function useUserAddedTokensOnChain(chainId: number | undefined | null): Token[] {
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    const tokenMap: Token[] = serializedTokensMap?.[chainId]
      ? Object.values(serializedTokensMap[chainId]).map((value) =>
          deserializeToken(value as SerializedToken, UserAddedToken)
        )
      : []
    return tokenMap
  }, [serializedTokensMap, chainId])
}

export function useUserAddedTokens(): Token[] {
  return useUserAddedTokensOnChain(useWeb3React().chainId)
}

export function useSlippageTolerance(): number {
  const { userSlippageTolerance } = useUserState()
  return useMemo(() => userSlippageTolerance, [userSlippageTolerance])
}

export function useExpertMode(): boolean {
  const { userExpertMode } = useUserState()
  return useMemo(() => (userExpertMode ? true : false), [userExpertMode])
}

export function useItemsPerPage(): number {
  const { userItemsPerPage } = useUserState()
  return useMemo(() => userItemsPerPage || initialState['userItemsPerPage'], [userItemsPerPage])
}
