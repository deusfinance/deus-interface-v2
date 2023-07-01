import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { Token } from '@sushiswap/core-sdk'

import { DEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'
import { RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { BaseButton } from 'components/Button'

const MainWrapper = styled.div<{ migrationStatus: string }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 30px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg2};
  background-image: ${({ migrationStatus }) =>
    migrationStatus ? `url(/static/images/pages/migration/${migrationStatus}.jpg)` : 'none'};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  padding: 12px 16px;
  padding-top: 20px;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  margin: 20px;
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

const MigrationButton = styled(BaseButton)<{ migrationStatus: string }>`
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

function migrationStatus(destinationTokens: Token[]) {
  if (destinationTokens.length === 1 && destinationTokens[0]?.name === DEUS_TOKEN.name) return 'full_deus'
  if (destinationTokens.length === 1 && destinationTokens[0]?.name === SYMM_TOKEN.name) return 'full_symm'
  else return 'balanced'
}

function getImageSize() {
  return isMobile ? 22 : 28
}

export default function MigrationCard({
  destinationTokens,
  sourceTokens,
}: {
  destinationTokens: Token[]
  sourceTokens: Token[]
}) {
  const text =
    destinationTokens.length === 1
      ? `Migrate Full to ${destinationTokens[0]?.name}`
      : `Migrate Balanced to ${destinationTokens[0]?.name} and ${destinationTokens[1]?.name}`

  const destinationTokensAddress = destinationTokens.map((token) => token.address)
  const destinationLogos = useCurrencyLogos(destinationTokensAddress)

  const sourceTokensAddress = sourceTokens.map((token) => token.address)
  const sourceLogos = useCurrencyLogos(sourceTokensAddress)

  return (
    <MainWrapper migrationStatus={migrationStatus(destinationTokens)}>
      <RowCenter>
        {destinationLogos.map((logo, index) => {
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
      </RowCenter>
      <RowCenter>{text}</RowCenter>
      <RowCenter>
        <MultipleImageWrapper isSingle={sourceLogos.length === 1}>
          {sourceLogos.map((logo, index) => {
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
      </RowCenter>
      <RowCenter>[Why? + How this easy migrate works?]</RowCenter>
      <RowCenter style={{ marginTop: 'auto' }}>
        <MigrationButton migrationStatus={migrationStatus(destinationTokens)}>
          Migrate to {destinationTokens[0]?.name} {destinationTokens[1] && 'and ' + destinationTokens[1]?.name}
        </MigrationButton>
      </RowCenter>
    </MainWrapper>
  )
}
