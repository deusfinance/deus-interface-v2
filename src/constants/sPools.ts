import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import { DEUS_TOKEN, DEUS_VDEUS_LP_TOKEN, VDEUS_TOKEN } from 'constants/tokens'
import { StablePool_DEUS_vDEUS } from './addresses'

export type StablePoolType = {
  id: number
  name: string
  swapFlashLoan: string
  liquidityTokens: Token[]
  lpToken: Token
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    id: 0,
    name: 'DEUS-vDEUS',
    swapFlashLoan: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    liquidityTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardsTokens: [VDEUS_TOKEN],
  },
]

export function getTokenIndex(symbolOrAddress: string, pool: StablePoolType): number | null {
  const { liquidityTokens: tokens } = pool
  for (let index = 0; index < tokens.length; index++) {
    if (
      symbolOrAddress.toLowerCase() == tokens[index].address.toLowerCase() ||
      symbolOrAddress.toLowerCase() == tokens[index].symbol?.toLowerCase()
    )
      return index
  }
  return null
}
