import { SupportedChainId } from 'constants/chains'
import { Token } from '@sushiswap/core-sdk'
import { duplicateTokenByAddressMap, duplicateTokenByChainId, TokenMap } from 'utils/token'
import {
  USDC_ADDRESS,
  DEUS_ADDRESS,
  DEI_ADDRESS,
  LQDR_ADDRESS,
  CLQDR_ADDRESS,
  XDEUS_ADDRESS,
  DEUS_VDEUS_LP_TOKEN_ADDRESS,
} from './addresses'

export const DEI_TOKEN = new Token(SupportedChainId.FANTOM, DEI_ADDRESS[SupportedChainId.FANTOM], 18, 'DEI', 'DEI')

// FIXME: this token is only used in migration page, do we need this?
export const DEIv2_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xd358f17774B69A8c06cfAA0d4402D2F604d4a4bF',
  18,
  'DEI',
  'DEI'
)

export const USDC_TOKEN = new Token(SupportedChainId.FANTOM, USDC_ADDRESS[SupportedChainId.FANTOM], 6, 'USDC', 'USDC')

export const DEUS_TOKEN = new Token(SupportedChainId.FANTOM, DEUS_ADDRESS[SupportedChainId.FANTOM], 18, 'DEUS', 'DEUS')

export const XDEUS_TOKEN = new Token(
  SupportedChainId.FANTOM,
  XDEUS_ADDRESS[SupportedChainId.FANTOM],
  18,
  'xDEUS',
  'xDEUS'
)

export const DEUS_VDEUS_LP_TOKEN = new Token(
  SupportedChainId.FANTOM,
  DEUS_VDEUS_LP_TOKEN_ADDRESS[SupportedChainId.FANTOM],
  18,
  'DV-LP',
  'DV-LP'
)

/* =====================================
                LQDR ADDRESS
===================================== */

export const LQDR_TOKEN = new Token(SupportedChainId.FANTOM, LQDR_ADDRESS[SupportedChainId.FANTOM], 18, 'LQDR', 'LQDR')

export const cLQDR_TOKEN = new Token(
  SupportedChainId.FANTOM,
  CLQDR_ADDRESS[SupportedChainId.FANTOM],
  18,
  'cLQDR',
  'cLQDR'
)

/* =====================================
                WETH ADDRESS
===================================== */
export const WETH = {
  [SupportedChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [SupportedChainId.POLYGON]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  [SupportedChainId.FANTOM]: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
}

/* =====================================
                USDC ADDRESS
===================================== */
export const USDC = {
  [SupportedChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [SupportedChainId.RINKEBY]: '0x49AC7cEDdb9464DA9274b164Cd6BA7129Da2C03E',
  [SupportedChainId.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
  [SupportedChainId.BSC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
}

/* =====================================
                WRAPPED NATIVE ADDRESS
===================================== */
export const WRAPPED_NATIVE = {
  [SupportedChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [SupportedChainId.RINKEBY]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  [SupportedChainId.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [SupportedChainId.FANTOM]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  [SupportedChainId.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
}

//TODO: replace Matic and ETH with NATIVE in whole app
export const Tokens: { [key: string]: TokenMap } = {
  USDT: {
    [SupportedChainId.MAINNET]: new Token(
      SupportedChainId.MAINNET,
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      6,
      'USDT',
      'Tether'
    ),
  },
  DAI: {
    [SupportedChainId.MAINNET]: new Token(
      SupportedChainId.MAINNET,
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      18,
      'DAI',
      'Dai'
    ),
  },
  WBTC: {
    [SupportedChainId.MAINNET]: new Token(
      SupportedChainId.MAINNET,
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      8,
      'WBTC',
      'wBTC'
    ),
  },
  WETH: duplicateTokenByAddressMap(WETH, 18, 'WETH', 'wETH'),
  USDC: duplicateTokenByAddressMap(USDC, 6, 'USDC', 'USD//C', { [SupportedChainId.BSC]: 18 }),
  DEI: duplicateTokenByChainId(DEI_ADDRESS[SupportedChainId.FANTOM], 18, 'DEI', 'DEI'),
  DEUS: duplicateTokenByChainId('0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
  WNATIVE: {
    [SupportedChainId.MAINNET]: new Token(1, WRAPPED_NATIVE[1], 18, 'WETH', 'Wrapped Ether'),
    [SupportedChainId.RINKEBY]: new Token(4, WRAPPED_NATIVE[4], 18, 'WETH', 'Wrapped Ether'),
    [SupportedChainId.POLYGON]: new Token(137, WRAPPED_NATIVE[137], 18, 'WMATIC', 'Wrapped Matic'),
    [SupportedChainId.FANTOM]: new Token(250, WRAPPED_NATIVE[250], 18, 'WFTM', 'Wrapped Fantom'),
    [SupportedChainId.BSC]: new Token(56, WRAPPED_NATIVE[56], 18, 'WBNB', 'Wrapped BNB'),
  },
}
