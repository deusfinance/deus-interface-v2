import styled from 'styled-components'
import { Token } from '@uniswap/sdk-core'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  flex-basis: 18%;
  /* margin-left: 10px; */

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
  /* gap: 6px; */
`

const MultipleImageWrapper = styled.div<{ isSingle?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  /* padding-right: ${({ isSingle }) => (isSingle ? '20px' : '0')}; */
  padding: 5px;
  border: 3px solid ${({ theme }) => theme.border1};
  border-radius: 100%;

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

export default function TokenBox({ token, active }: { token: Token; active: boolean }) {
  const logo = useCurrencyLogo(token.address)

  return (
    <TokenCell>
      <MultipleImageWrapper isSingle>
        <ImageWithFallback src={logo} width={getImageSize()} height={getImageSize()} alt={`Logo`} round />
      </MultipleImageWrapper>

      <TokensWrap>
        <span style={{ textAlign: 'left' }}>{token.name}</span>
      </TokensWrap>
    </TokenCell>
  )
}
