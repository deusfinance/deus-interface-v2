import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export interface Wallet {
  walletType: string
  account: string
}

type TokenAddress = string
export type TokenBalancesMap = Record<TokenAddress, CurrencyAmount<Token>>
export type TokenBalancesMapWithUndefined = Record<TokenAddress, CurrencyAmount<Token> | undefined>
