import { useMemo } from 'react'
import { getAddress } from '@ethersproject/address'
import { Token, Currency } from '@uniswap/sdk-core'
import { isAddress } from 'utils/validate'

import FTM_LOGO from '/public/static/images/tokens/ftm.png'
import ETH_LOGO from '/public/static/images/tokens/eth.png'
import USDC_E_LOGO from '/public/static/images/tokens/usdc-e.png'

import NotFound from '/public/static/images/fallback/not-found-eth.svg'
import USDT_LOGO from '/public/static/images/tokens/usdt.svg'
import WETH_LOGO from '/public/static/images/tokens/weth.svg'
import ARB_LOGO from '/public/static/images/tokens/arb.svg'
import DEI_LOGO from '/public/static/images/tokens/dei.svg'
import fUSDT_LOGO from '/public/static/images/tokens/usdt.svg'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import USDC_LOGO from '/public/static/images/tokens/usdc.svg'
import WBTC_LOGO from '/public/static/images/tokens/wbtc.svg'
import DAI_LOGO from '/public/static/images/tokens/dai.svg'
import VDEUS_LOGO from '/public/static/images/tokens/vdeus.svg'
import RAM_LOGO from '/public/static/images/tokens/ram.svg'

export const LogoMap: { [contractOrSymbol: string]: string } = {
  DAI: DAI_LOGO,
  USDT: USDT_LOGO,
  WBTC: WBTC_LOGO,
  DEI: DEI_LOGO,
  DEUS: DEUS_LOGO,
  USDC: USDC_LOGO,
  xDEUS: VDEUS_LOGO,
  vDEUS: VDEUS_LOGO,
  RAM: RAM_LOGO,
  fUSDT: fUSDT_LOGO,
  WETH: WETH_LOGO,

  //rare tokens
  'USDC.e': USDC_E_LOGO.src,
  FTM: FTM_LOGO.src,
  ARB: ARB_LOGO.src,
  ETH: ETH_LOGO.src,

  '0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0': DEI_LOGO,
  '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44': DEUS_LOGO,
  '0x953Cd009a490176FcEB3a26b9753e6F01645ff28': VDEUS_LOGO,
  '0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418': RAM_LOGO,
}

export default function useCurrencyLogo(contractOrSymbol?: string | Token | Currency): string {
  return useMemo(() => {
    let query = contractOrSymbol
    try {
      if (query) {
        if (typeof query === 'string') {
          if (isAddress(query)) {
            query = getAddress(query)
          }
          if (query in LogoMap) {
            return LogoMap[query]
          }
        } else {
          query = query.isNative ? 'ETH' : query
          if (typeof query === 'string') {
            return LogoMap[query]
          }
          if (query.symbol && query.symbol in LogoMap) {
            return LogoMap[query.symbol]
          }
          if (query.address && query.address in LogoMap) {
            return LogoMap[query.address]
          }
          query = query.address
        }
      }
      return `https://raw.githubusercontent.com/RamsesExchange/ramses-assets/master/blockchains/arbitrum/assets/${query}/logo.png`
    } catch (err) {
      return NotFound
    }
  }, [contractOrSymbol])
}
