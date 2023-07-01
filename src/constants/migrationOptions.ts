import { Token } from '@sushiswap/core-sdk'
import { DEUS_TOKEN, Tokens, XDEUS_TOKEN, bDEI_TOKEN } from 'constants/tokens'
import { SupportedChainId } from './chains'

export enum MigrationVersion {
  DUAL,
  ONLY_SYMM,
}

export type MigrationTypes = {
  id: number
  token: Token
  version: MigrationVersion
  active: boolean
}

export const MigrationOptions: MigrationTypes[] = [
  {
    id: 0,
    token: DEUS_TOKEN,
    version: MigrationVersion.ONLY_SYMM,
    active: true,
  },
  {
    id: 1,
    token: XDEUS_TOKEN,
    version: MigrationVersion.ONLY_SYMM,
    active: true,
  },
  {
    id: 2,
    token: Tokens['LEGACY_DEI'][SupportedChainId.FANTOM],
    version: MigrationVersion.DUAL,
    active: true,
  },
  {
    id: 3,
    token: bDEI_TOKEN,
    version: MigrationVersion.DUAL,
    active: true,
  },
]
