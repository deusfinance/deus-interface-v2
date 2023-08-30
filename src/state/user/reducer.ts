import { createReducer } from '@reduxjs/toolkit'

import { SerializedToken } from 'types/token'
import { ConnectionType } from 'connection'
import {
  updateSelectedWallet,
  updateUserSlippageTolerance,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserExpertMode,
  updateItemsPerPage,
  addSerializedToken,
} from './actions'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  selectedWallet?: ConnectionType

  matchesDarkMode: boolean // whether the dark mode media query matches
  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  userExpertMode: boolean | null // the expert user's choice it for disable review modal and enable submit buggy tx
  userHideClosedPositions: boolean // for hiding CL positions

  userSlippageTolerance: number // user defined slippage tolerance in percentages
  timestamp: number
  userItemsPerPage: number
  tokenId: number | null

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
}

export const initialState: UserState = {
  selectedWallet: undefined,

  matchesDarkMode: false,
  userDarkMode: true,
  userExpertMode: false,
  userHideClosedPositions: false,

  userSlippageTolerance: 2,
  timestamp: currentTimestamp(),
  userItemsPerPage: 10,
  tokenId: null,
  tokens: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })

    .addCase(updateSelectedWallet, (state, action) => {
      state.selectedWallet = action.payload.wallet
    })

    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })

    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })

    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })

    .addCase(updateItemsPerPage, (state, action) => {
      state.userItemsPerPage = action.payload.userItemsPerPage
    })

    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
)
