import { Token } from '@sushiswap/core-sdk'
import { DEUS_TOKEN, Tokens, XDEUS_TOKEN } from 'constants/tokens'
import { SupportedChainId } from './chains'

export type MigrationTypes = {
  id: number
  token: Token
  active: boolean
}

export const MigrationOptions: MigrationTypes[] = [
  {
    id: 0,
    token: DEUS_TOKEN,
    active: true,
  },
  {
    id: 1,
    token: XDEUS_TOKEN,
    active: true,
  },
  {
    id: 2,
    token: Tokens['LEGACY_DEI'][SupportedChainId.FANTOM],
    active: true,
  },
  {
    id: 3,
    token: Tokens['DEI'][SupportedChainId.FANTOM],
    active: true,
  },
]
