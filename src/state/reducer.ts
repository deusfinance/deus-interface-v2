import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import dashboard from './dashboard/reducer'
import connection from './connection/reducer'
import wallets from './wallet/reducer'
import multicall from 'lib/state/multicall'

const reducer = combineReducers({
  dashboard,
  application,
  transactions,
  user,
  connection,
  wallets,
  multicall: multicall.reducer,
})

export default reducer
