// import StaticImageData from 'next/image'
// import { isAddress } from './address'
import { SupportedChainId, SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { AddressMap, DecimalMap } from 'utils/address'
import { Token } from '@sushiswap/core-sdk'

// export interface IToken {
//   chainId: number
//   address: string
//   decimals: number
//   symbol: string
//   name: string
//   isNative: boolean
//   isToken: boolean
// }

export type TokenMap = {
  [key: number]: Token
}

export function duplicateTokenByChainId(
  address: string,
  decimals: number,
  name: string,
  symbol: string,
  chains: SupportedChainId[] = SUPPORTED_CHAIN_IDS,
  tokensToAdd: Token[] = [] // Changed parameter to an array of tokens
): TokenMap {
  // Filter out the chain IDs of all tokens in tokensToAdd from the chains array
  const filteredChains =
    tokensToAdd.length > 0
      ? chains.filter((chainId) => !tokensToAdd.some((token) => token.chainId === chainId))
      : chains

  // Start the accumulator with the tokens in tokensToAdd
  const initialTokenMap = tokensToAdd.reduce((acc, token) => {
    acc[token.chainId] = token
    return acc
  }, {} as TokenMap)

  return filteredChains.reduce((acc: TokenMap, chainId: number) => {
    acc[chainId] = new Token(chainId, address, decimals, symbol, name)
    return acc
  }, initialTokenMap)
}

//generate same tokens by given AddressMap
export function duplicateTokenByAddressMap(
  addressMap: AddressMap,
  decimals: number,
  name: string,
  symbol: string,
  decimalMap: DecimalMap = {}
): TokenMap {
  return Object.keys(addressMap)
    .map((chainId) => Number(chainId)) //convert string to number because of the object.keys() always returns string
    .reduce((acc: TokenMap, chainId: number) => {
      acc[chainId] = new Token(chainId, addressMap[chainId], decimalMap[chainId] ?? decimals, name, symbol)
      return acc
    }, {})
}

// export class Token implements IToken {
//   chainId: number
//   address: string
//   decimals: number
//   symbol: string
//   name: string
//   isNative: boolean
//   isToken: boolean

//   constructor(chainId: number, address: string, decimals: number, symbol: string, name: string) {
//     this.chainId = chainId
//     this.address = address
//     this.decimals = decimals
//     this.symbol = symbol
//     this.name = name
//     this.isNative = this.getIsNative()
//     this.isToken = this.getIsToken()
//   }

//   private getIsNative(): boolean {
//     return this.address === '0x'
//   }

//   private getIsToken(): boolean {
//     return isAddress(this.address) ? true : false
//   }
// }
