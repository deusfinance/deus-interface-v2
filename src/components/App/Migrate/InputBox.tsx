import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { RowBetween } from '../../Row/index'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { formatBalance } from 'utils/numbers'
import { NoWrapSpan } from './HeaderBox'

const Wrapper = styled.div`
  font-family: Inter;
  background: rgb(28 28 28);
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  padding: 0.6rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: 10px;
  font-size: 1.5rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
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

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text1};

  &:hover {
    cursor: pointer;
  }
`

const TokenName = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  padding-left: 4px;
`

const MaxButton = styled.span`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-left: 4px;

  &:hover {
    cursor: pointer;
  }
`

export default function InputBox({
  currency,
  value,
  onChange,
  disabled,
  maxValue,
  onTokenSelect,
  hideBalance,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  disabled?: boolean
  maxValue?: string | null
  onTokenSelect?: () => void
  hideBalance?: boolean
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo(currency?.wrapped?.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const balanceDisplay = useMemo(() => {
    if (!maxValue) return formatBalance(maxAmountSpend(currencyBalance)?.toExact() ?? '0')
    return formatBalance(maxValue)
  }, [currencyBalance, maxValue])

  const balanceExact = useMemo(() => {
    if (!maxValue) return maxAmountSpend(currencyBalance)?.toExact()
    return maxValue
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  function getImageSize() {
    return isMobile ? 22 : 30
  }

  return (
    <Wrapper>
      <RowBetween alignItems={'center'}>
        <TokenName>{currency?.symbol}</TokenName>
        {!hideBalance && (
          <Balance onClick={handleClick}>
            <NoWrapSpan>{maxValue ? 'Available:' : 'Balance:'}</NoWrapSpan>
            {balanceDisplay ? balanceDisplay : '0.00'}
            {!disabled && <MaxButton>MAX</MaxButton>}
          </Balance>
        )}
      </RowBetween>
      <RowBetween>
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder="0.0"
          autoFocus
          disabled={disabled}
          style={{ textAlign: 'left', height: '50px', fontSize: '1.3rem' }}
        />
        <Row onClick={onTokenSelect ? () => onTokenSelect() : undefined}>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          {onTokenSelect && <ChevronDown />}
        </Row>
      </RowBetween>
    </Wrapper>
  )
}
