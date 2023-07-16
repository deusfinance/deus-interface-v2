import { Tokens } from 'constants/tokens'
import { TokenMap } from 'utils/token'
import { MigrationChains, SupportedChainId } from './chains'

export enum MigrationVersion {
  DUAL,
  ONLY_SYMM,
}

export type MigrationTypes = {
  id: number
  token: TokenMap
  version: MigrationVersion
  supportedChains: SupportedChainId[]
  active: boolean
}

export const MigrationOptions: MigrationTypes[] = [
  {
    id: 0,
    token: Tokens['DEUS'],
    version: MigrationVersion.ONLY_SYMM,
    supportedChains: MigrationChains,
    active: true,
  },
  {
    id: 1,
    token: Tokens['XDEUS'],
    version: MigrationVersion.ONLY_SYMM,
    supportedChains: [SupportedChainId.FANTOM, SupportedChainId.MAINNET],
    active: true,
  },
  {
    id: 2,
    token: Tokens['LEGACY_DEI'],
    version: MigrationVersion.DUAL,
    supportedChains: MigrationChains,
    active: true,
  },
  {
    id: 3,
    token: Tokens['bDEI_TOKEN'],
    version: MigrationVersion.DUAL,
    supportedChains: [SupportedChainId.FANTOM, SupportedChainId.ARBITRUM],
    active: true,
  },
]
