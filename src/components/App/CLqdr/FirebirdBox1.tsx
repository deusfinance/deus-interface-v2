import React from 'react'
import styled from 'styled-components'
import FIREBIRD_ICON from '/public/static/images/pages/clqdr/ic_firebird.svg'

import { RowBetween, RowEnd } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { ExternalLink } from 'components/Link'
import { BuyButton, Wrapper } from '.'
import { LQDR_ADDRESS, CLQDR_ADDRESS } from 'constants/addresses'
import { ArrowRight, ArrowUpRight } from 'react-feather'
import QuestionMark from 'components/Icons/QuestionMark'
import { ToolTip } from 'components/ToolTip'
import { useClqdrData, useFetchFirebirdData } from 'hooks/useClqdrPage'
import { formatBalance } from '../../../utils/numbers'

const MainWrapper = styled(Wrapper)`
  height: 164px;
  padding: 16px 16px 21px 16px;
`

const RatioWrap = styled(RowBetween)`
  white-space: nowrap;
  font-size: 0.75rem;
  height: 25%;
`

const Name = styled.div`
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:12px
  `}
`

const FirebirdText = styled.div`
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  text-align: center;

  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:14px
  `}
`

const Value = styled.div`
  font-family: 'Noto Sans Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 19px;

  text-align: right;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:12px
  `}
`

const MintValue = styled(Value)`
  color: ${({ theme }) => theme.green1};
`

const Icon = styled.div`
  position: absolute;
  left: -45px;
  top: -15px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

const QuestionMarkWrap = styled.div`
  margin-left: 6px;
  display: inline;
  background: transparent;
`

const ButtonText = styled.span`
  font-family: 'Noto Sans';
  background: ${({ theme }) => theme.primary8};
  color: ${({ theme }) => theme.primary8};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 19px;

  text-align: center;
  text-decoration-line: underline;
`

const ValueBox = styled(RowEnd)`
  & > * {
    &:nth-child(2) {
      margin: 0 5px;
    }
  }
`

export default function FirebirdBox1() {
  const firebird = useFetchFirebirdData('1')
  const { mintRate } = useClqdrData()

  return (
    <MainWrapper>
      <Icon>
        <ImageWithFallback src={FIREBIRD_ICON} width={174} height={198} alt={'icon'} />
      </Icon>
      <RatioWrap>
        <FirebirdText>
          cLQDR on Firebird
          <QuestionMarkWrap>
            <ToolTip id="id" />
            <QuestionMark data-for="id" data-tip={'Hello World'} width={16} height={16} />
          </QuestionMarkWrap>
        </FirebirdText>
        <Value>
          <ExternalLink
            href={`https://app.firebird.finance/swap?inputCurrency=${LQDR_ADDRESS[250]}&outputCurrency=${CLQDR_ADDRESS[250]}&net=250`}
            style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255, 128, 128, 0.5)' }}
          >
            <BuyButton>
              <ButtonText>Buy cLQDR</ButtonText>
              <ArrowUpRight size={18} color={'#F34038'} style={{ marginTop: '3px' }} />
            </BuyButton>
          </ExternalLink>
        </Value>
      </RatioWrap>
      <RatioWrap>
        <Name>cLQDR/LQDR Ratio on Firebird:</Name>
        <MintValue>{firebird && firebird.convertRate ? formatBalance(firebird.convertRate, 4) : '-'}</MintValue>
      </RatioWrap>
      <RatioWrap>
        <Name>Mint cLQDR:</Name>
        <ValueBox>
          <Value>{`1 LQDR`}</Value>
          <ArrowRight size={13} />
          <Value>{`${formatBalance(1 / mintRate, 3)} cLQDR`}</Value>
        </ValueBox>
      </RatioWrap>
      <RatioWrap>
        <Name>Buy on Firebird:</Name>
        <ValueBox>
          <MintValue>{`1 LQDR`}</MintValue>
          <ArrowRight size={13} />
          <MintValue>{`≈${
            firebird && firebird.convertRate ? formatBalance(1 / firebird?.convertRate, 3) : '0'
          } cLQDR`}</MintValue>
        </ValueBox>
      </RatioWrap>
    </MainWrapper>
  )
}
