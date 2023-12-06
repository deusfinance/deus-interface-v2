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
  tokenToAdd?: Token // Optional parameter for the token to add
): TokenMap {
  // If tokenToAdd is provided, filter out its chainId from the chains array
  const filteredChains = tokenToAdd ? chains.filter((chainId) => chainId !== tokenToAdd.chainId) : chains

  return filteredChains.reduce(
    (acc: TokenMap, chainId: number) => {
      acc[chainId] = new Token(chainId, address, decimals, symbol, name)
      return acc
    },
    tokenToAdd ? { [tokenToAdd.chainId]: tokenToAdd } : {}
  ) // Conditionally add tokenToAdd
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
