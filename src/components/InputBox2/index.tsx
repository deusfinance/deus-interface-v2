import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'

export const Wrapper = styled(Row)`
  background: #28292b;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 72px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bg4};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}
`

export const InputWrapper = styled.div`
  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 0;
  `}
`

const NumericalWrapper = styled.div`
  width: 100%;
  font-size: 24px;
  position: relative;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
`

export const CurrencySymbol = styled.div<{ active?: any }>`
  font-family: 'Space Grotesk';
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;

  `}
`

export const RightWrapper = styled.div<{ borderLeft?: boolean }>`
  width: 100%;
  border-left: ${({ theme, borderLeft }) => (borderLeft ? `1px solid ${theme.border1}` : 'none')};
  padding: 5px;
  padding-left: 10px;
  height: 100%;
  position: relative;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;

  /* padding-left: 10px; */
  width: 80px;
  min-width: 60px;
  cursor: ${({ active }) => active && 'pointer'};
`

export const RowWrap = styled(RowEnd)`
  gap: 10px;
  font-size: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 3px;
  `}
`

export const ChevronDown = styled(ChevronDownIcon)`
  margin-left: 7px;
  width: 16px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
  `}
`

const Balance = styled(RowWrap)<{ disabled?: boolean }>`
  font-family: 'Noto Sans Mono';
  font-weight: 500;
  font-size: 10px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text1};
  width: 20px;

  & > span {
    background: ${({ theme }) => theme.bg2};
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.5rem;
    color: ${({ theme }) => theme.text1};

    &:hover {
      background: ${({ theme }) => theme.clqdrBlueColor};
      color: ${({ theme }) => theme.black};
      cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    }
  }

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function InputBox({
  currency,
  value,
  onChange,
  onTokenSelect,
  disabled,
  hideBalance,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  onTokenSelect?: () => void
  disabled?: boolean
  hideBalance?: boolean
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo((currency as Token)?.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
  }, [currencyBalance])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange || disabled) return
    onChange(balanceExact)
  }, [balanceExact, disabled, onChange])

  return (
    <Wrapper>
      <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined} active={onTokenSelect ? true : false}>
        <ImageWithFallback
          src={logo}
          width={getImageSize()}
          height={getImageSize()}
          alt={`${currency?.symbol} Logo`}
          round
          blackAndWhite={currency?.wrapped?.address === '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44'}
        />
        {onTokenSelect ? <ChevronDown /> : null}
      </LogoWrapper>

      <RightWrapper borderLeft={true}>
        <RowBetween>
          <CurrencySymbol
            onClick={onTokenSelect ? () => onTokenSelect() : undefined}
            active={onTokenSelect ? true : false}
          >
            {currency?.wrapped?.address === '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44'
              ? 'multiDEUS'
              : currency?.symbol}
          </CurrencySymbol>
          {!hideBalance && (
            <Balance disabled={disabled} onClick={handleClick}>
              balance: {balanceDisplay ? balanceDisplay : '0.00'}
              {!disabled && <span>MAX</span>}
            </Balance>
          )}
        </RowBetween>
        <NumericalWrapper>
          <NumericalInput
            value={value || ''}
            onUserInput={onChange}
            placeholder={disabled ? '0.0' : 'Enter an amount'}
            autoFocus
            disabled={disabled}
          />
        </NumericalWrapper>
      </RightWrapper>
    </Wrapper>
  )
}
