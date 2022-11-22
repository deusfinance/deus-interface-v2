import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import CLQDR_ICON from '/public/static/images/pages/clqdr/ic_clqdr.svg'
import CLQDR_LOGO from '/public/static/images/tokens/clqdr.svg'
import DEFIWAR_LOGO from '/public/static/images/pages/clqdr/defi_war.svg'

import { LQDR_TOKEN, cLQDR_TOKEN } from 'constants/tokens'
import { CLQDR_ADDRESS } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { formatBalance, toBN } from 'utils/numbers'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useDepositLQDRCallback } from 'hooks/useClqdrCallback'
import { useCalcSharesFromAmount, useClqdrData, useFetchFirebirdData } from 'hooks/useClqdrPage'
import useDebounce from 'hooks/useDebounce'

import { ArrowBubble, DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import DefaultReviewModal from 'components/App/CLqdr/DefaultReviewModal'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton as MainButtonWrap,
  ConnectWallet,
} from 'components/App/StableCoin'
import { Row, RowCenter, RowEnd, RowStart } from 'components/Row'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/CLqdr/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
import FireBird1 from 'components/App/CLqdr/FirebirdBox1'
import BalanceBox from 'components/App/CLqdr/BalanceBox'
import PicBox from 'components/App/CLqdr/PicBox'
import BuyClqdrInputBox from 'components/App/CLqdr/BuyClqdrInputBox'
import Dropdown from 'components/App/CLqdr/Dropdown'
import { truncateAddress } from 'utils/address'
import { ExternalLink } from 'components/Link'

const Wrapper = styled(MainWrapper)`
  /* margin-top: 16px; */
  /* margin-left: 0px; */
  margin: unset;
`

const MainButton = styled(MainButtonWrap)`
  background: ${({ theme }) => theme.primary5};
  color: ${({ theme, disabled }) => (disabled ? theme.white : theme.black)};

  &:hover {
    background: linear-gradient(270deg, #14e8e3 -1.33%, #01aef3 100%);
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      border: 1px solid ${theme.border1};
      cursor: default;

      &:focus,
      &:hover {
        background: ${theme.bg2};
      }
  `}
`
const BuyAnyWayButton = styled(MainButtonWrap)`
  background: ${({ theme }) => theme.primary5};
  color: ${({ theme, disabled }) => (disabled ? theme.white : theme.orange)};
  opacity: 0.33;

  &:hover {
    background: linear-gradient(270deg, #14e8e3 -1.33%, #01aef3 100%);
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      border: 1px solid ${theme.border1};
      cursor: default;

      &:focus,
      &:hover {
        background: ${theme.bg2};
      }
  `}
`

const ArrowBox = styled(RowCenter)`
  height: 26px;
  width: 26px;
  border-radius: 14px;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.lqdrColor};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: clamp(250px, 90%, 984px);
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column-reverse
  `}
`
const LeftWrapper = styled.div`
  display: flex;
  width: 50%;
  /* justify-content: center; */
  flex-direction: column;
  & > * {
    margin-top: 16px;
  }
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:100%;
  `}
`
const RightWrapper = styled.div`
  display: flex;
  width: 50%;
  /* justify-content: center; */
  flex-direction: column;
  & > * {
    margin-top: 16px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:100%;
    align-items: center;
  `}
`

const Chart = styled.div`
  width: clamp(250px, 90%, 484px);
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  height: 258px;
`

const BackgroundImage = styled.div`
  position: absolute;
  width: 720px;
  height: 510px;
  background: linear-gradient(90deg, #0badf4 0%, #30efe4 53.12%, #ff9af5 99.99%);
  opacity: 0.1;
  filter: blur(120px);
`

const Item = styled(Row)`
  /* width: 484px; */
  width: clamp(250px, 90%, 484px);
  height: 48px;
  padding: 16px 16px 16px 24px;
  background: ${({ theme }) => theme.bg2};

  &:hover {
    background: ${({ theme }) => theme.border4};
  }
`

const ClqdrItem = styled(Item)`
  height: unset;
  display: flex;
  flex-direction: column;
`

const ItemWrapper = styled.div`
  border-radius: 0px 0px 12px 12px;
  width: 484px;
`

const ItemText = styled(RowStart)`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;

  color: ${({ theme }) => theme.text2};
`
const ItemValue = styled(RowEnd)`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  cursor: pointer;
  line-height: 16px;
  text-decoration-line: underline;

  color: ${({ theme }) => theme.text1};
`

const SolidValue = styled(ItemValue)`
  text-decoration-line: none;
`
const GreenItem = styled(ItemValue)`
  text-decoration-line: none;
  color: ${({ theme }) => theme.green1};
`

const XLQDR = styled.span`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-decoration-line: underline;
  background: linear-gradient(339.11deg, #1984ff 9.31%, #4dd9f6 96.03%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`
const LQDRText = styled.p`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-indent: -15px;
  /* text-decoration-line: underline; */
  /* background: linear-gradient(339.11deg, #1984ff 9.31%, #4dd9f6 96.03%); */
  /* -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent; */
`

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const { burningFee, mintRate } = useClqdrData()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)

  const inputCurrency = LQDR_TOKEN
  const outputCurrency = cLQDR_TOKEN

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const [amount, setAmount] = useState('')
  const debouncedAmount = useDebounce(amount, 500)
  const amountOutBN = useCalcSharesFromAmount(amount)

  const formattedAmountOut = amountOutBN == '' ? '0' : toBN(amountOutBN).div(1e18).toFixed()

  const firebird = useFetchFirebirdData(debouncedAmount)

  const token1Amount = useMemo(() => {
    return tryParseAmount(amount, inputCurrency || undefined)
  }, [amount, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return inputCurrencyBalance?.lessThan(token1Amount)
  }, [inputCurrencyBalance, token1Amount])

  const { state: mintCallbackState, callback: mintCallback, error: mintCallbackError } = useDepositLQDRCallback(amount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CLQDR_ADDRESS[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amount
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amount])

  const info = useMemo(() => {
    return [
      { title: 'Max Slippage', value: '1' },
      { title: 'Txn Deadline', value: '3' },
      { title: 'Network Fee', value: '1' },
      { title: 'Min Received', value: '3' },
    ]
  }, [])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(mintCallbackState, mintCallbackError)
    if (!mintCallback) return
    try {
      setAwaitingMintConfirmation(true)
      const txHash = await mintCallback()
      setAwaitingMintConfirmation(false)
      console.log({ txHash })
      toggleReviewModal(false)
      setAmount('')
    } catch (e) {
      setAwaitingMintConfirmation(false)
      toggleWarningModal(true)
      toggleReviewModal(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [mintCallback, mintCallbackError, mintCallbackState])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null
    else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    } else if (showApproveLoader) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    } else if (showApprove)
      return <MainButton onClick={() => handleApprove()}>Allow us to spend {inputCurrency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    else if (showApprove) return null
    else if (insufficientBalance) return <MainButton disabled>Insufficient {inputCurrency?.symbol} Balance</MainButton>
    else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return (
      <MainButton
        onClick={() => {
          if (amount !== '0' && amount !== '' && amount !== '0.') toggleReviewModal(true)
        }}
      >
        Mint {outputCurrency?.symbol}
      </MainButton>
    )
  }

  function getContracts(): JSX.Element {
    return (
      <ItemWrapper>
        <Item>
          <ItemText>cLQDR contract:</ItemText>
          <ItemValue>
            <ExternalLink
              href={`https://ftmscan.com/address/0x814c66594a22404e101FEcfECac1012D8d75C156`}
              style={{ textDecoration: 'underline' }}
            >
              {truncateAddress('0x814c66594a22404e101FEcfECac1012D8d75C156')}
            </ExternalLink>
          </ItemValue>
        </Item>
        <Item>
          <ItemText>Collactor Proxy:</ItemText>
          <ItemValue>
            <ExternalLink
              href={`https://ftmscan.com/address/0x30d1900306FD84EcFBCb16F821Aba69054aca15C`}
              style={{ textDecoration: 'underline' }}
            >
              {truncateAddress('0x30d1900306FD84EcFBCb16F821Aba69054aca15C')}
            </ExternalLink>
          </ItemValue>
        </Item>
        <Item>
          <ItemText>BuyBack Contract:</ItemText>
          <ItemValue>
            <ExternalLink
              href={`https://ftmscan.com/address/0xCD3563CD8dE2602701d5d9f960db30710fcc4053`}
              style={{ textDecoration: 'underline' }}
            >
              {truncateAddress('0xCD3563CD8dE2602701d5d9f960db30710fcc4053')}
            </ExternalLink>
          </ItemValue>
        </Item>
        <Item>
          <ItemText>Oracle:</ItemText>
          <ItemValue>
            <ExternalLink
              href={`https://ftmscan.com/address/0x2e5a83cE42F9887E222813371c5cA2bA1e827700`}
              style={{ textDecoration: 'underline' }}
            >
              {truncateAddress('0x2e5a83cE42F9887E222813371c5cA2bA1e827700')}
            </ExternalLink>
          </ItemValue>
        </Item>
      </ItemWrapper>
    )
  }
  function getDefiWars(): JSX.Element {
    return (
      <ItemWrapper>
        <Item>
          <ItemText>Tokens:</ItemText>
          <ItemValue>{truncateAddress('0x814c66594a22404e101fecfecac1012d8d75c156')}</ItemValue>
        </Item>
        <Item>
          <ItemText>Expected Ratio:</ItemText>
          <SolidValue>1.422?</SolidValue>
        </Item>
        <Item>
          <ItemText>Market Ratio:</ItemText>
          <SolidValue>1.42?</SolidValue>
        </Item>
        <Item>
          <ItemText>Peg for 1k:</ItemText>
          <GreenItem>99.34%?</GreenItem>
        </Item>
      </ItemWrapper>
    )
  }
  function getCLqdrData(): JSX.Element {
    return (
      <ItemWrapper>
        <ClqdrItem>
          <LQDRText>
            cLQDR is a wrapped token derivative built on top of <XLQDR>xLQDR</XLQDR> that has several benefits. cLQDR:
          </LQDRText>
          <LQDRText>1.Allows users to sell their position in secondary markets.</LQDRText>
          <LQDRText>
            2.Compounds all the rewards (cLQDR increases vs. LQDR overtime). This increases long-term returns and makes
            cLQDR easier to integrate with borrow markets, LPs, and other protocols. This also simplifies holding
            because users {`don't`} need to claim rewards, since rewards are automatically compounded into the{' '}
            {`holder's`}
            position.
          </LQDRText>
          <LQDRText>
            3.Holders profit from the rewards and the bribes that xLQDR holders receive, and also from the performance
            fees collected through strategies.
          </LQDRText>
          <LQDRText>
            4.Creates constant buy pressure for LQDR and perpetually locks a large portion of {`LQDR's`} supply.
          </LQDRText>
          <LQDRText>
            5.Allows users to leverage their cLQDR position to borrow our overcollateralized stablecoin, MOR. Holders
            can then use that MOR to earn more yield.
          </LQDRText>
        </ClqdrItem>
      </ItemWrapper>
    )
  }

  const items = useMemo(
    () =>
      firebird
        ? [
            { name: 'LQDR Price', value: `$${formatBalance(firebird.lqdrPrice, 3)}` },
            { name: 'cLQDR/LQDR Ratio', value: `${formatBalance(mintRate, 4)}` },
          ]
        : [],
    [firebird, mintRate]
  )

  return (
    <>
      <Container>
        {/* <Hero>
          <Image src={CLQDR_LOGO} height={'90px'} alt="Logo" />
          <StatsHeader items={items} />
        </Hero> */}
        <BackgroundImage />

        <ContentWrapper>
          <LeftWrapper>
            {firebird && firebird.convertRate < mintRate && (
              <FireBird1 ratio={formatBalance(firebird.convertRate, 4) ?? ''} />
            )}
            <Chart>cLQDR/LQDR Ratio</Chart>
            <Chart>Circulation</Chart>

            <PicBox />
            <Dropdown content={getDefiWars()} logo={DEFIWAR_LOGO} text={'DefiWars'} />
            <Dropdown content={getCLqdrData()} logo={CLQDR_LOGO} text={'What is cLQDR?'} />
            <Dropdown content={getContracts()} logo={CLQDR_LOGO} text={'Contracts'} />
          </LeftWrapper>
          <RightWrapper>
            <BalanceBox />

            <Wrapper>
              <Tableau title={'cLQDR'} imgSrc={CLQDR_ICON} />

              <InputWrapper>
                <InputBox
                  currency={inputCurrency}
                  value={amount}
                  onChange={setAmount}
                  // onTokenSelect={() => {
                  //   toggleTokensModal(true)
                  //   setInputTokenIndex(inputTokenIndex)
                  // }}
                />
                <ArrowBox>
                  <ArrowBubble size={24} />
                </ArrowBox>
                <InputBox
                  currency={outputCurrency}
                  value={formattedAmountOut == '0' ? '' : formattedAmountOut}
                  onChange={() => console.log('')}
                  disabled
                />
                <BuyClqdrInputBox currency={inputCurrency} value={amount} onChange={setAmount} disabled />
                <div style={{ marginTop: '30px' }}></div>
                {getApproveButton()}
                {getActionButton()}
              </InputWrapper>

              <BottomWrapper>
                <InfoItem name={'Management Fee'} value={`${burningFee}%`} />
                <InfoItem
                  name={'Rate on Firebird'}
                  value={
                    amount && Number(amount) > 0
                      ? `${formatBalance(amount, 6)} LQDR = ${formatBalance(firebird?.cLqdrAmountOut, 6)} cLQDR`
                      : '-'
                  }
                />
              </BottomWrapper>
            </Wrapper>
          </RightWrapper>
        </ContentWrapper>
      </Container>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amount} cLQDR by ${amount} LQDR`]}
      />

      <DefaultReviewModal
        title="Review Mint Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[LQDR_TOKEN]}
        outputTokens={[cLQDR_TOKEN]}
        amountsIn={[amount]}
        amountsOut={[formattedAmountOut]}
        info={info}
        data={''}
        buttonText={'Confirm Mint'}
        awaiting={awaitingMintConfirmation}
        summary={`Minting ${formattedAmountOut} cLQDR by ${amount} LQDR`}
        handleClick={handleMint}
      />
    </>
  )
}
