import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { Token } from '@sushiswap/core-sdk'

import { RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { BaseButton } from 'components/Button'
import { useWeb3React } from '@web3-react/core'
import { TokenMap } from 'utils/token'
import { SupportedChainId } from 'constants/chains'
import { DeusText } from '../Stake/RewardBox'
import { ExternalLink } from 'components/Link'
import React from 'react'
import { SymmText } from './HeaderBox'

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 30px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg2};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding: 12px 16px;
  padding-top: 20px;
  width: 95%;
  height: 100%;
  border-radius: 12px;
  margin: 20px auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 15px auto;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 10px auto;
    width: 100%;
    height: '400px';
    margin-inline: 0px;
    background-position-y: -25px;
  `};
`
const MultipleImageWrapper = styled.div<{ isSingle?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  padding-right: ${({ isSingle }) => (isSingle ? '20px' : '0')};
  border-radius: 100%;

  & > * {
    &:nth-child(2) {
      transform: translateX(-30%);
    }
    &:nth-child(3) {
      transform: translateX(-60%);
    }
    &:nth-child(4) {
      transform: translateX(-90%);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      width: 28px;
      height: 28px;
    }
`}
`

export const MigrationButton = styled(BaseButton)<{ migrationStatus?: string }>`
  height: 40px;
  border-radius: 8px;
  background: #141414;
  background: ${({ theme, migrationStatus }) =>
    migrationStatus === 'full_deus'
      ? theme.deusColor
      : migrationStatus === 'full_symm'
      ? 'linear-gradient(270deg, #D4FDF9 0%, #D7C7C1 23.44%, #D9A199 41.15%, #F095A2 57.81%, #FFA097 81.25%, #D5EEE9 99.99%)'
      : 'linear-gradient(270deg, #90D2D2 0%, #D4F9F4 50%, #F3CBD0 99.99%)'};
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 2px;

  &:hover {
    filter: brightness(1.2);
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 12px;
  `}
`
const LargeContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 100%;
  row-gap: 30px;
  margin: 0 auto;
`

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin: 8px;

  p {
    line-height: 24px;
    color: ${({ theme }) => theme.text1};
    font-size: 12px;
    font-weight: 700;
    margin: 0 auto;
  }
  & > p:last-child {
    margin-top: 24px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: initial;
    margin: 4px;
  `}
`
interface MigrationCardProps {
  destinationLogos: string[]
  text: string
  sourceLogos: string[]
  deus: string
  symm: string
}

const LargeMigrationCard = ({ destinationLogos, text, sourceLogos, deus, symm }: MigrationCardProps) => {
  return (
    <LargeContainer>
      <MainWrapper>
        <RowCenter style={{ opacity: '0.2' }}>
          {destinationLogos.map((logo, index) => {
            return (
              <ImageWithFallback src={logo} width={getImageSize()} height={getImageSize()} alt={`Logo`} key={index} />
            )
          })}
        </RowCenter>
        <RowCenter style={{ opacity: '0.2' }}>{text}</RowCenter>

        <RowCenter style={{ opacity: '0.2' }}>
          <MultipleImageWrapper isSingle={sourceLogos.length === 1}>
            {sourceLogos.map((logo, index) => {
              return (
                <React.Fragment key={index}>
                  {true && <ImageWithFallback src={logo} width={getImageSize()} height={getImageSize()} alt={`Logo`} />}
                </React.Fragment>
              )
            })}
          </MultipleImageWrapper>
        </RowCenter>
        <DescriptionContainer>
          <p style={{ color: 'green', fontSize: '16px' }}>CONGRATULATIONS</p>
          <p>You are fully migrated,</p>
          <p>see you in Q4!</p>
          <p>
            Migrated amount: {deus} <DeusText>TO DEUS</DeusText>, {symm} <SymmText>TO SYMM</SymmText>
          </p>
        </DescriptionContainer>
        <RowCenter style={{ marginTop: 'auto' }}>
          <ExternalLink href="https://docs.symm.io" style={{ textDecoration: 'none', width: '100%' }}>
            <MigrationButton>Learn more about SYMMIO</MigrationButton>
          </ExternalLink>
        </RowCenter>
      </MainWrapper>
    </LargeContainer>
  )
}

function getImageSize() {
  return isMobile ? 22 : 28
}

const Wrapper = styled.div`
  width: 100%;
`

export default function CongratsCard({
  destinationTokens,
  sourceTokens,
  deus,
  symm,
}: {
  destinationTokens: Token[]
  sourceTokens: TokenMap[]
  deus: string
  symm: string
}) {
  const { chainId } = useWeb3React()

  const text =
    destinationTokens.length === 1
      ? `Migrate Full to ${destinationTokens[0]?.name}`
      : `Migrate Balanced to ${destinationTokens[0]?.name} and ${destinationTokens[1]?.name}`

  const destinationTokensAddress = destinationTokens.map((token) => token.address)
  const destinationLogos = useCurrencyLogos(destinationTokensAddress)

  const chainSourceTokens = sourceTokens.map((token) => {
    if (chainId && token[chainId]) {
      return token[chainId]
    } else {
      return token[SupportedChainId.FANTOM]
    }
  })
  const sourceTokensAddress = chainSourceTokens.map((token) => token.address)
  const sourceLogos = useCurrencyLogos(sourceTokensAddress)

  return (
    <Wrapper>
      <LargeMigrationCard
        destinationLogos={destinationLogos}
        sourceLogos={sourceLogos}
        text={text}
        deus={deus}
        symm={symm}
      />
    </Wrapper>
  )
}
