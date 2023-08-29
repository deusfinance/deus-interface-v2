import { Token } from '@uniswap/sdk-core'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export class UserAddedToken extends Token {}
