import { useMemo } from 'react'

import NotFound from '/public/static/images/fallback/not_found.png'
import DEI_LOGO from '/public/static/images/tokens/dei.svg'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import USDC_LOGO from '/public/static/images/tokens/usdc.svg'
import BDEI_LOGO from '/public/static/images/tokens/bdei.svg'
import xDEUS_LOGO from '/public/static/images/tokens/xdeus.svg'
import LQDR_ICON from '/public/static/images/tokens/lqdr.svg'
import CLQDR_ICON from '/public/static/images/tokens/clqdr.svg'

const LogoMap: { [contractOrSymbol: string]: string } = {
  // symbols
  FTM: 'https://assets.spooky.fi/tokens/FTM.png',
  DEI: DEI_LOGO,
  DEUS: DEUS_LOGO,
  // contracts
  // make sure these values are checksummed! https://ethsum.netlify.app/
  '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'https://assets.spooky.fi/tokens/wFTM.png', // wFTM
  '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75': USDC_LOGO, // USDC
  '0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0': DEI_LOGO,
  '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44': DEUS_LOGO,
  '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8': BDEI_LOGO,
  '0x953Cd009a490176FcEB3a26b9753e6F01645ff28': xDEUS_LOGO,
  '0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9': LQDR_ICON,
  '0x814c66594a22404e101FEcfECac1012D8d75C156': CLQDR_ICON,
  '0xECd9E18356bb8d72741c539e75CEAdB3C5869ea0': NotFound.src, // default the logo of dv-lp token address to that of a not found one
  usdc: USDC_LOGO,
  deus: DEUS_LOGO,
}

export default function useCurrencyLogo(contractOrSymbol?: string): string {
  return useMemo(() => {
    try {
      if (contractOrSymbol && contractOrSymbol in LogoMap) {
        return LogoMap[contractOrSymbol]
      }
      return `https://assets.spooky.fi/tokens/${contractOrSymbol}.png`
    } catch (err) {
      return NotFound.src
    }
  }, [contractOrSymbol])
}

export function useCurrencyLogos(contractsOrSymbols: string[]): string[] {
  return useMemo(() => {
    return contractsOrSymbols?.map((contract) => {
      if (contract && contract in LogoMap) return LogoMap[contract]
      return `https://assets.spooky.fi/tokens/${contract}.png`
    })
  }, [contractsOrSymbols])
}
