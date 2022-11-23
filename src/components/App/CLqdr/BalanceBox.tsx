import React, { useMemo } from 'react'
import styled from 'styled-components'
import CLQDR_ICON from '/public/static/images/pages/clqdr/clqdr_logo.svg'
import LQDR_ICON from '/public/static/images/pages/clqdr/lqdr_logo.svg'

import { RowEnd, RowStart } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { useClqdrData, useFetchFirebirdData } from 'hooks/useClqdrPage'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { cLQDR_TOKEN, LQDR_TOKEN } from 'constants/tokens'
import useWeb3React from 'hooks/useWeb3'
import { formatBalance } from 'utils/numbers'

const MainWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  height: 164px;
`

const RatioWrap = styled.div`
  display: flex;
  white-space: nowrap;
  font-size: 0.75rem;
  height: 40%;
  width: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.bg2};
  border-radius: 0px 0px 12px 12px;
  padding: 12px 16px;
`

const BalanceWrap = styled(RatioWrap)`
  background: ${({ theme }) => theme.bg1};
  height: 60%;
  border-radius: 12px 12px 0px 0px;
  padding: 16px 12px;
`

const Name = styled(RowStart)`
  font-family: 'Noto Sans';
  font-style: normal;
  font-size: 12px;
  color: ${({ theme }) => theme.text4};
`

const Value = styled(RowEnd)`
  color: ${({ theme }) => theme.text1};
`

const EstimatedValue = styled.div`
  margin-left: 6px;
  color: ${({ theme }) => theme.text4};
`

const Item = styled.div`
  display: flex;
  flex-direction: row;
  height: 50%;
  vertical-align: baseline;
`
const LqdrBalance = styled(RowStart)`
  font-family: 'Noto Sans';
  font-weight: 500;
  font-size: 14px;

  background: ${({ theme }) => theme.lqdrColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const CLqdrBalance = styled(RowStart)`
  font-family: 'Noto Sans';
  vertical-align: middle;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.blueClqdrColor};
`

const Logo = styled.div`
  min-width: 24px;
  min-height: 24px;
  margin-top: 5px;
  margin-right: 8px;
`

export default function BalanceBox() {
  const { account } = useWeb3React()
  const firebird = useFetchFirebirdData('1')
  const { mintRate } = useClqdrData()

  const lqdrBalance = useCurrencyBalance(account ?? undefined, LQDR_TOKEN ?? undefined)
  const cLqdrBalance = useCurrencyBalance(account ?? undefined, cLQDR_TOKEN ?? undefined)

  const [lqdrBalanceDisplay] = useMemo(() => {
    return [lqdrBalance?.toSignificant(3)]
  }, [lqdrBalance])

  const [cLqdrBalanceDisplay] = useMemo(() => {
    return [cLqdrBalance?.toSignificant(3)]
  }, [cLqdrBalance])

  return (
    <MainWrapper>
      <BalanceWrap>
        <Item>
          <Logo>
            <ImageWithFallback src={LQDR_ICON} width={24} height={24} alt={'lqdr_logo'} />
          </Logo>
          <LqdrBalance>Your LQDR Balance:</LqdrBalance>
          <RowEnd>
            <Value>{lqdrBalanceDisplay ? lqdrBalanceDisplay : '0.00'}</Value>
            <EstimatedValue>
              {` ≈ $${
                lqdrBalanceDisplay && firebird
                  ? formatBalance(firebird?.lqdrPrice * Number(lqdrBalanceDisplay), 3)
                  : '0.00'
              }`}
            </EstimatedValue>
          </RowEnd>
        </Item>
        <Item>
          <Logo>
            <ImageWithFallback src={CLQDR_ICON} width={24} height={24} alt={'clqdr_logo'} />
          </Logo>
          <CLqdrBalance>Your cLQDR Balance:</CLqdrBalance>
          <RowEnd>
            <Value>{cLqdrBalanceDisplay ? cLqdrBalanceDisplay : '0.00'}</Value>
            <EstimatedValue>
              {` ≈ $${
                cLqdrBalanceDisplay && firebird
                  ? formatBalance(firebird?.lqdrPrice * firebird?.convertRate * Number(cLqdrBalanceDisplay), 3)
                  : '0.00'
              }`}
            </EstimatedValue>
          </RowEnd>
        </Item>
      </BalanceWrap>
      <RatioWrap>
        <Item>
          <Name>cLQDR/LQDR Ratio:</Name>
          <Value>{formatBalance(mintRate, 3) ?? '-'}</Value>
        </Item>
        <Item>
          <Name>LQDR Price:</Name>
          <Value>${firebird?.lqdrPrice.toFixed(2) ?? '-'}</Value>
        </Item>
      </RatioWrap>
    </MainWrapper>
  )
}
