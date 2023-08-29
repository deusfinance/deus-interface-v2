import { Ether, NativeCurrency, Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
// import { getAddress } from '@ethersproject/address'

import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { WRAPPED_NATIVE_ADDRESS } from 'constants/addresses'
import { FALLBACK_CHAIN_ID, SupportedChainId, SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { AddressMap, DecimalMap } from 'utils/address'
import { SerializedToken } from 'types/token'

export const NATIVE_CHAIN_ID = 'NATIVE'
export const DEFAULT_ERC20_DECIMALS = 18

export type TokenMap = {
  [chainId: number]: Token
}

export type TokenAddressMap = {
  [chainId: number]: { [address: string]: Token }
}

export function duplicateTokenByChainId(
  address: string,
  decimals: number,
  name: string,
  symbol: string,
  chains: SupportedChainId[] = SUPPORTED_CHAIN_IDS
): TokenMap {
  return chains.reduce((acc: TokenMap, chainId: number) => {
    acc[chainId] = new Token(chainId, address, decimals, symbol, name)
    return acc
  }, {})
}

//generate same tokens by given AddressMap
export function duplicateTokenByAddressMap(
  addressMap: AddressMap,
  decimals: number,
  symbol: string,
  name: string,
  decimalMap: DecimalMap = {}
): TokenMap {
  return Object.keys(addressMap)
    .map((chainId) => Number(chainId)) //convert string to number because of the object.keys() always returns string
    .reduce((acc: TokenMap, chainId: number) => {
      acc[chainId] = new Token(chainId, addressMap[chainId], decimalMap[chainId] ?? decimals, symbol, name)
      return acc
    }, {})
}

export function getTokenWithFallbackChainId(tokenMap: TokenMap, chainId: number | undefined): Token {
  if (chainId) return tokenMap[chainId]
  return tokenMap[FALLBACK_CHAIN_ID]
}

class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) return wrapped
    throw new Error('Unsupported chain ID')
  }
  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {}

export function nativeOnChain(chainId: number): NativeCurrency | Token {
  let nativeCurrency: NativeCurrency | Token
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]
  else {
    nativeCurrency = ExtendedEther.onChain(chainId)
  }
  return (cachedNativeCurrency[chainId] = nativeCurrency)
}

// export function getCombinedTokens(): TokenAddressMap {
//   const tokenList = [
//     RAMSES_TOKEN,
//     NEADRAM_TOKEN,
//     ARB_TOKEN,
//     WRAPPED_NATIVE_CURRENCY,
//     USDC_NATIVE_TOKEN,
//     USDT_TOKEN,
//     FRAX_TOKEN,
//   ]
//   const combinedToken: TokenAddressMap = {}
//   for (let i = 0; i < tokenList.length; i++) {
//     const token = tokenList[i]
//     const chains = Object.keys(token).map((c) => Number(c))
//     for (let j = 0; j < chains.length; j++) {
//       if (!combinedToken[chains[j]]) {
//         combinedToken[chains[j]] = {}
//       }
//       const tokenMap = combinedToken[chains[j]]
//       tokenMap[token[chains[j]].address] = token[chains[j]]
//     }
//   }

//   return combinedToken
// }

/** Sorts currency amounts (descending). */
export function balanceComparator(a?: CurrencyAmount<Currency>, b?: CurrencyAmount<Currency>) {
  if (a && b) {
    return a.greaterThan(b) ? -1 : a.equalTo(b) ? 0 : 1
  } else if (a?.greaterThan('0')) {
    return -1
  } else if (b?.greaterThan('0')) {
    return 1
  }
  return 0
}

type TokenBalances = { [tokenAddress: string]: CurrencyAmount<Currency> | undefined }

/** Sorts tokens by currency amount (descending), then safety, then symbol (ascending). */
export function tokenComparator(balances: TokenBalances, a: Currency, b: Currency) {
  // Sorts by balances
  const balanceComparison = balanceComparator(
    balances[a.isNative ? 'ETH' : a.wrapped.address],
    balances[b.isNative ? 'ETH' : b.wrapped.address]
  )
  if (balanceComparison !== 0) return balanceComparison

  // Sorts by symbol
  if (a.symbol && b.symbol) {
    return a.symbol.toLowerCase() < b.symbol.toLowerCase() ? -1 : 1
  }

  return -1
}

export function convertWrapToNativeSymbol(token: Token | undefined): string | undefined {
  return token?.wrapped.address === WRAPPED_NATIVE_ADDRESS[SupportedChainId.ARBITRUM] ? 'ETH' : token?.symbol
}

//for logo
export function convertWrapToNativeToken(token: Token | undefined): Token | string | undefined {
  return token?.wrapped.address === WRAPPED_NATIVE_ADDRESS[SupportedChainId.ARBITRUM] ? 'ETH' : token
}

// export function getUsdcESymbol(address: string): string | null | undefined {
//   return USDC_TOKEN[SupportedChainId.ARBITRUM].address === getAddress(address)
//     ? USDC_TOKEN[SupportedChainId.ARBITRUM].symbol
//     : null
// }

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function deserializeToken(serializedToken: SerializedToken, Class: typeof Token = Token): Token {
  return new Class(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}
