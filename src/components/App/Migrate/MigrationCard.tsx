import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { Token } from '@sushiswap/core-sdk'

import { DEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'
import { RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { useTokenBalances } from 'state/wallet/hooks'
import { BaseButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import ReviewModal from './ReviewModal'
import useWeb3React from 'hooks/useWeb3'

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

export const MigrationButton = styled(BaseButton)<{ migrationStatus: string; disabled?: boolean }>`
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

  ${({ disabled }) =>
    disabled &&
    `
      opacity: 0.4;
      cursor: default;
  `}

  &:hover {
    filter: ${({ disabled }) => (disabled ? 'none' : 'brightness(1.2)')};
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
  const { account } = useWeb3React()
  const [isOpenReviewModal, toggleReviewModal] = useState(false)

  const text =
    destinationTokens.length === 1
      ? `Migrate Full to ${destinationTokens[0]?.name}`
      : `Migrate Balanced to ${destinationTokens[0]?.name} and ${destinationTokens[1]?.name}`

  const reviewText =
    destinationTokens.length === 1
      ? `Migrate to ${destinationTokens[0]?.name}`
      : `Migrate to ${destinationTokens[0]?.name} and ${destinationTokens[1]?.name}`

  const destinationTokensAddress = destinationTokens.map((token) => token.address)
  const destinationLogos = useCurrencyLogos(destinationTokensAddress)
  const destinationBalances = useTokenBalances(account?.toString(), destinationTokens)

  const sourceTokensAddress = sourceTokens.map((token) => token.address)
  const sourceLogos = useCurrencyLogos(sourceTokensAddress)
  const sourceBalances = useTokenBalances(account?.toString(), sourceTokens)

  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState(false)

  return (
    <>
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
        <RowCenter>
          <ExternalLink href={`https://docs.deus.finance/`}>[Why? + How this easy migrate works?]</ExternalLink>
        </RowCenter>
        <RowCenter style={{ marginTop: 'auto' }}>
          <MigrationButton onClick={() => toggleReviewModal(true)} migrationStatus={migrationStatus(destinationTokens)}>
            {reviewText}
          </MigrationButton>
        </RowCenter>
      </MainWrapper>
      <ReviewModal
        title={'Full ' + reviewText}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={sourceTokens}
        outputTokens={destinationTokens}
        amountsIn={sourceBalances}
        amountsOut={destinationBalances}
        inputTokenLogos={sourceLogos}
        outputTokenLogos={destinationLogos}
        migrationStatus={migrationStatus(destinationTokens)}
        buttonText={awaitingSwapConfirmation ? 'Migrating ' : reviewText}
        awaiting={awaitingSwapConfirmation}
        handleClick={() => console.log('')}
      />
    </>
  )
}
