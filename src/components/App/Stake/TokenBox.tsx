import styled, { useTheme } from 'styled-components'
import { Token } from '@uniswap/sdk-core'
import { isMobile } from 'react-device-detect'

import { SupportedChainId } from 'constants/chains'

import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { useWeb3React } from '@web3-react/core'

import ImageWithFallback from 'components/ImageWithFallback'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  flex-basis: 18%;
  margin-left: 15px;

  & > * {
    &:first-child {
      margin-right: 8px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-basis: initial;
    margin-left: 0px;
  `};
`

const TokensWrap = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: start;
  gap: 6px;
  /* margin: 0 10px; */
`

const MultipleImageWrapper = styled.div<{ isSingle?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  padding-right: ${({ isSingle }) => (isSingle ? '20px' : '0')};

  & > * {
    &:nth-child(2) {
      transform: translateX(-30%);
      margin-right: -9px;
    }
    &:nth-child(3) {
      transform: translateX(-60%);
      margin-right: -9px;
    }
    &:nth-child(4) {
      transform: translateX(-90%);
      margin-right: -9px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      width: 28px;
      height: 28px;
    }
`}
`

function getImageSize() {
  return isMobile ? 22 : 30
}

export default function TokenBox({
  tokens,
  title,
  chain,
  active,
}: {
  tokens: Token[]
  title: string
  chain: string
  active: boolean
}) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)
  const theme = useTheme()
  const { chainId } = useWeb3React()

  return (
    <TokenCell>
      <MultipleImageWrapper isSingle={logos.length === 1}>
        {logos.map((logo, index) => {
          return (
            <ImageWithFallback
              src={logo}
              width={getImageSize()}
              height={getImageSize()}
              alt={`Logo`}
              key={index}
              round
            />
          )
        })}
      </MultipleImageWrapper>
      <TokensWrap>
        <span style={{ textAlign: 'left' }}>{title}</span>
        {chainId === SupportedChainId.FANTOM && active ? (
          <div>
            <span style={{ color: theme.blue2 }}>{chain}</span>
            <span> | </span>
            <span style={{ color: theme.green1 }}>Live</span>
          </div>
        ) : (
          <span style={{ color: theme.red1 }}>{!active ? 'Inactive' : 'Wrong Network'}</span>
        )}
      </TokensWrap>
    </TokenCell>
  )
}
