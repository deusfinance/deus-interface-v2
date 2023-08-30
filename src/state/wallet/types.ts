import { CurrencyAmount, Token } from '@sushiswap/core-sdk'

export interface Wallet {
  walletType: string
  account: string
}

type TokenAddress = string
export type TokenBalancesMap = Record<TokenAddress, CurrencyAmount<Token>>
