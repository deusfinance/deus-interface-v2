import React, { Dispatch, SetStateAction, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { Token } from '@sushiswap/core-sdk'

import { DEUS_TOKEN, SYMM_TOKEN } from 'constants/tokens'
import { Row, RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { useTokenBalances } from 'state/wallet/hooks'
import { BaseButton } from 'components/Button'
import ReviewModal from './ReviewModal'
import useWeb3React from 'hooks/useWeb3'
import { ChevronDown as ChevronDownIcon, ChevronUp } from 'components/Icons'
import Column from 'components/Column'
import { TokenMap } from 'utils/token'
import { SupportedChainId } from 'constants/chains'

const MainWrapper = styled.div<{ migrationStatus: string; isOpen?: boolean }>`
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
  padding: 12px 16px;
  padding-top: 20px;
  width: 95%;
  height: 100%;
  border-radius: 12px;
  margin: 20px auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 15px auto;
  `}
  ${({ theme, isOpen }) => theme.mediaWidth.upToSmall`
    margin: 10px auto;
    width: 100%;
    height:${isOpen ? '400px' : 'fit-content'};
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
const MiniHeadingContainer = styled.div`
  display: flex;
  cursor: pointer;
  position: relative;
  flex-direction: row;
  width: 100%;
  column-gap: 12px;
  & > div {
    width: auto;
  }
  & > svg {
    position: absolute;
    right: 0;
  }
`
const MiniContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const MiniContainer = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:100%;
    display:flex;
    flex-direction:column;
 `}
`
const LargeContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 100%;
  row-gap: 30px;
  margin: 0 auto;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -14px;
  p {
    line-height: 24px;
    color: ${({ theme }) => theme.text1};
    font-size: 12px;
    font-weight: 700;
  }
  & > p:last-child {
    margin-top: 24px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top:initial;
  `}
`
interface MigrationCardProps {
  destinationLogos: string[]
  text: string
  sourceLogos: string[]
  toggleReviewModal: Dispatch<SetStateAction<boolean>>
  reviewText: string
  destinationTokens: Token[]
  firstDescription: string
  secondDescription: string
}
const MiniMigrationCard = ({
  destinationLogos,
  text,
  sourceLogos,
  toggleReviewModal,
  reviewText,
  destinationTokens,
  firstDescription,
  secondDescription,
}: MigrationCardProps) => {
  const [isOpen, setOpen] = useState(false)
  return (
    <MiniContainer>
      <MainWrapper isOpen={isOpen} migrationStatus={migrationStatus(destinationTokens)}>
        <MiniHeadingContainer onClick={() => setOpen((prev) => !prev)}>
          <Row>
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
          </Row>
          <Row fontSize={14} fontWeight={500}>
            {text}
          </Row>
          {isOpen ? <ChevronUp /> : <ChevronDownIcon />}
        </MiniHeadingContainer>
        {isOpen && (
          <MiniContent>
            <Column>
              <RowCenter marginBottom={16}>
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
              <DescriptionContainer>
                <p>{firstDescription}</p>
                <p>{secondDescription}</p>
              </DescriptionContainer>
            </Column>
          </MiniContent>
        )}
        <RowCenter style={{ marginTop: 'auto' }}>
          <MigrationButton onClick={() => toggleReviewModal(true)} migrationStatus={migrationStatus(destinationTokens)}>
            {reviewText}
          </MigrationButton>
        </RowCenter>
      </MainWrapper>
    </MiniContainer>
  )
}
const LargeMigrationCard = ({
  destinationLogos,
  text,
  sourceLogos,
  toggleReviewModal,
  reviewText,
  destinationTokens,
  firstDescription,
  secondDescription,
}: MigrationCardProps) => {
  return (
    <LargeContainer>
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
                <React.Fragment key={index}>
                  {true && (
                    <ImageWithFallback src={logo} width={getImageSize()} height={getImageSize()} alt={`Logo`} round />
                  )}
                </React.Fragment>
              )
            })}
          </MultipleImageWrapper>
        </RowCenter>
        <DescriptionContainer>
          <p>{firstDescription}</p>
          <p>{secondDescription}</p>
        </DescriptionContainer>
        <RowCenter style={{ marginTop: 'auto' }}>
          <MigrationButton onClick={() => toggleReviewModal(true)} migrationStatus={migrationStatus(destinationTokens)}>
            {reviewText}
          </MigrationButton>
        </RowCenter>
      </MainWrapper>
    </LargeContainer>
  )
}
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
  firstDescription,
  secondDescription,
}: {
  destinationTokens: Token[]
  sourceTokens: TokenMap[]
  firstDescription: string
  secondDescription: string
}) {
  const { account, chainId } = useWeb3React()
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

  const chainSourceTokens = sourceTokens.map((token) => {
    if (chainId && token[chainId]) {
      return token[chainId]
    } else {
      return token[SupportedChainId.FANTOM]
    }
  })
  const sourceTokensAddress = chainSourceTokens.map((token) => token.address)
  const sourceLogos = useCurrencyLogos(sourceTokensAddress)
  const sourceBalances = useTokenBalances(account?.toString(), chainSourceTokens)

  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState(false)

  return (
    <div style={{ width: '100%' }}>
      <MiniMigrationCard
        destinationLogos={destinationLogos}
        destinationTokens={destinationTokens}
        reviewText={reviewText}
        sourceLogos={sourceLogos}
        text={text}
        toggleReviewModal={toggleReviewModal}
        firstDescription={firstDescription}
        secondDescription={secondDescription}
      />

      <LargeMigrationCard
        destinationLogos={destinationLogos}
        destinationTokens={destinationTokens}
        reviewText={reviewText}
        sourceLogos={sourceLogos}
        text={text}
        toggleReviewModal={toggleReviewModal}
        firstDescription={firstDescription}
        secondDescription={secondDescription}
      />

      <ReviewModal
        title={'Full ' + reviewText}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={chainSourceTokens}
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
    </div>
  )
}
