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

export const getImageSize = () => {
  return isMobile ? 17 : 20
}

export default function ClaimBox({
  tokenSymbol,
  currency,
  amount,
  cooldownDuration,
  endTime,
}: {
  tokenSymbol: string
  currency: Currency
  amount: BigNumber
  cooldownDuration: string
  endTime: string
}) {
  const { account, chainId } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const logo = useCurrencyLogo((currency as Token)?.address)
  const DEUS_logo = useCurrencyLogo((DEUS_TOKEN_FTM as Token)?.address)

  const [awaitingConvertConfirmation, setAwaitingConvertConfirmation] = useState(false)
  const [endTimeDeadline, setEndTimeDeadline] = useState('')
  const [isEndTimeFinished, setIsEndTimeFinished] = useState(false)

  useEffect(() => {
    return autoRefresh(() => {
      const { diff, hours, minutes, seconds } = getRemainingTime(Number(endTime))
      setIsEndTimeFinished(diff === 0)
      setEndTimeDeadline(`${hours}h : ${minutes}m : ${seconds}s`)
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
      return <MainButton disabled>Claim in {endTimeDeadline}</MainButton>
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
