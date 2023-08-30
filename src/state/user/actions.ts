import { createAction } from '@reduxjs/toolkit'
import { ConnectionType } from 'connection'
import { SerializedToken } from 'types/token'

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('user/updateUserExpertMode')
export const updateSelectedWallet = createAction<{ wallet: ConnectionType | undefined }>('user/updateSelectedWallet')
export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'user/updateUserSlippageTolerance'
)
export const updateItemsPerPage = createAction<{ userItemsPerPage: number }>('user/updateItemsPerPage')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
