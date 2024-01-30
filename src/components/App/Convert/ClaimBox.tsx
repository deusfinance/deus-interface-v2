import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Currency, Token } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'

import useWeb3React from 'hooks/useWeb3'
import { ContentTable, Value } from '../Staking/common/Layout'
import { MainButton } from './ConvertBox'
import { DotFlashing } from 'components/Icons'
import { useWalletModalToggle } from 'state/application/hooks'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { DEUS_TOKEN_FTM } from 'constants/tokens'
import { formatBalance, formatNumber, toBN } from 'utils/numbers'
import { useClaimTokenConversionCallback } from 'hooks/useDeusConversionCallback'
import { getRemainingTime } from 'utils/time'
import { autoRefresh } from 'utils/retry'
import { useLastConversionTime } from 'hooks/useDeusConversionPage'
import { RowCenter } from 'components/Row'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`
const Wrapper = styled(Container)`
  width: clamp(250px, 75%, 500px);
  background-color: #1a1b1b;
  padding: 20px 15px;
  border-radius: 15px;
  justify-content: center;
`
const SubTitle = styled.p`
  color: #bfb4a8;
  text-align: center;
  font-family: IBM Plex Mono;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-top: 12px;
`
const RemainingWrap = styled(RowCenter)`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(270deg, #0a7471 -1.33%, #005779 100%);
  color: ${({ theme }) => theme.black};
  height: 50px;
  cursor: progress;

  & > * {
    &:first-child {
      z-index: 100;
      font-family: 'Inter';
      font-weight: 700;
    }
  }
`
const RemainingBlock = styled.div<{ width?: string }>`
  background: linear-gradient(270deg, #14e8e3 -1.33%, #01aef3 100%);
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
  width: ${({ width }) => width ?? 'unset'};
`

export const getImageSize = () => {
  return isMobile ? 17 : 20
}

export default function ClaimBox({
  tokenSymbol,
  currency,
  amount,
  cooldownDuration,
}: {
  tokenSymbol: string
  currency: Currency
  amount: BigNumber
  cooldownDuration: string
}) {
  const { account, chainId } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const [LastConversionTime] = useLastConversionTime()
  const endTime = Number(LastConversionTime[0]?.toString()) + Number(cooldownDuration)

  const logo = useCurrencyLogo((currency as Token)?.address)
  const DEUS_logo = useCurrencyLogo((DEUS_TOKEN_FTM as Token)?.address)

  const [awaitingConvertConfirmation, setAwaitingConvertConfirmation] = useState(false)
  const [endTimeDeadline, setEndTimeDeadline] = useState('')
  const [diff, setDiff] = useState(0)
  const [isEndTimeFinished, setIsEndTimeFinished] = useState(false)

  useEffect(() => {
    return autoRefresh(() => {
      const { diff, day, hours, minutes, seconds } = getRemainingTime(Number(endTime))

      setIsEndTimeFinished(diff === 0)
      setEndTimeDeadline(`${day}d :${hours}h : ${minutes}m : ${seconds}s`)
      setDiff(diff)
    }, 1)
  }, [endTime, chainId])

  const {
    state: convertCallbackState,
    callback: convertCallback,
    error: convertCallbackError,
  } = useClaimTokenConversionCallback(currency)

  const handleClaim = useCallback(async () => {
    console.log('called handleConvert')
    console.log(convertCallbackState, convertCallbackError)
    if (!convertCallback) return
    try {
      setAwaitingConvertConfirmation(true)
      const txHash = await convertCallback()
      setAwaitingConvertConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingConvertConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [convertCallback, convertCallbackError, convertCallbackState])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (awaitingConvertConfirmation) {
      return (
        <MainButton>
          Claiming <DotFlashing />
        </MainButton>
      )
    } else if (!isEndTimeFinished) {
      const elapsed = (Number(cooldownDuration) * 1000 - diff) / (Number(cooldownDuration) * 10)
      return (
        <RemainingWrap>
          <p>Claim in {endTimeDeadline}</p>
          <RemainingBlock width={elapsed.toFixed(0) + '%'}></RemainingBlock>
        </RemainingWrap>
      )
    }
    return <MainButton onClick={() => handleClaim()}>Claim</MainButton>
  }

  return (
    <Wrapper>
      <div>My {tokenSymbol} to DEUS Migration</div>
      <ContentTable>
        <p style={{ fontSize: '14px' }}>Deposited {tokenSymbol}:</p>
        <Value style={{ display: 'flex' }}>
          {amount?.toString() && (
            <span style={{ marginRight: '5px' }}>
              {formatNumber(formatBalance(toBN(Number(amount?.toString()) * 1e-18).toString()))}
            </span>
          )}
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
            blackAndWhite={currency?.wrapped?.address === '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44'}
          />
        </Value>
      </ContentTable>

      <ContentTable>
        <p style={{ fontSize: '14px' }}>Claimable DEUS:</p>
        <Value style={{ display: 'flex' }}>
          {amount?.toString() && (
            <span style={{ marginRight: '5px' }}>
              {formatNumber(formatBalance(toBN(Number(amount?.toString()) * 1e-18).toString()))}
            </span>
          )}
          <ImageWithFallback src={DEUS_logo} width={getImageSize()} height={getImageSize()} alt={'DEUS logo'} round />
        </Value>
      </ContentTable>

      <div style={{ marginBottom: '30px' }} />

      {amount && amount.gt(0) && getActionButton()}

      <SubTitle>{`by submitting a new ${tokenSymbol}->DEUS migration the cooldown will be restarted.`}</SubTitle>
    </Wrapper>
  )
}
