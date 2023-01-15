import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { useDeusPrice } from 'hooks/useCoingeckoPrice'

import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { Container, Title } from 'components/App/StableCoin'
import SwapPage from 'components/App/Swap'
import { useVDeusStats } from 'hooks/useVDeusStats'
import SingleChart from 'components/App/Swap/SingleChart'
import { Row } from 'components/Row'
import { ExternalLink } from 'components/Link'
import Image from 'next/image'
import ExternalLinkImage from '/public/static/images/pages/common/down.svg'

const Wrapper = styled(Row)`
  margin-top: 50px;
  width: clamp(500px, 90%, 1000px);
  align-items: flex-start;
  flex-direction: row;
  gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`

export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #0badf4 -10.26%, #30efe4 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

export const TopBorderWrap = styled.div<{ active?: boolean }>`
  background: ${({ theme }) => theme.deusColor};
  padding: 1px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.cLqdrColor};
  flex: 1;

  &:hover {
    filter: brightness(0.8);
  }
`

export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;
  height: 100%;
  width: 100%;
  display: flex;
`
const ExternalLinkContainer = styled.div`
  align-self: center;
  display: flex;
  background: none;
  a {
    color: ${({ theme }) => theme.text2};
    &:hover {
      color: ${({ theme }) => theme.text2};
      text-decoration: underline;
    }
  }
`
export default function Vest() {
  const deusPrice = useDeusPrice()
  const { swapRatio } = useVDeusStats()

  const items = useMemo(
    () => [
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) },
      { name: 'xDeus Ratio', value: formatAmount(swapRatio, 2) + ' DEUS' },
      {
        name: '',
        value: (
          <ExternalLinkContainer>
            <ExternalLink href="https://docs.deus.finance/xdeus/xdeus">
              Read more <Image alt="read more" width={10} height={10} src={ExternalLinkImage} />
            </ExternalLink>
          </ExternalLinkContainer>
        ),
        hasOwnColor: true,
      },
    ],
    [deusPrice, swapRatio]
  )

  return (
    <Container>
      <Hero>
        <Title>DEUS/xDEUS Converter</Title>
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        <SingleChart label={'xDEUS Ratio'} />
        <SwapPage />
      </Wrapper>
    </Container>
  )
}
