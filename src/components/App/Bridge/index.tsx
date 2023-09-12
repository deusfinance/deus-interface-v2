import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { RefreshCcw, RefreshCw } from 'react-feather'

import { DEUS_TOKEN, Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import useCurrencyBalance, { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { useToggleWalletModal } from 'state/application/hooks'
import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { ApprovalState, useApproveCallback } from 'lib/hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import { SupportedChainId, isSupportedChain } from 'constants/chains'
import { useAxlGatewayContract } from 'hooks/useContract'
import useBridgeCallback from 'hooks/useBridgeCallback'
import MigrationHeader from './MigrationHeader'
import { ChainInfo } from 'constants/chainInfo'
import { Link as LinkIcon } from 'components/Icons'
import { ExternalLink } from 'components/Link'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`
const Wrapper = styled(Container)`
  width: clamp(250px, 75%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
  & > * {
    &:nth-child(3) {
      margin: 15px auto;
    }
    &:nth-child(7) {
      margin-top: 20px !important;
      padding: 0;
    }
  }
`
const MainButton = styled(PrimaryButton)`
  border-radius: 12px;
`
const ExternalLinkIcon = styled(LinkIcon)`
  margin-left: 4px;
  path {
    fill: ${({ theme }) => theme.text1};
  }
`

export default function SwapPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useToggleWalletModal()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
  const [reversed, setReversed] = useState(false)
  const debouncedAmountIn = useDebounce(amountIn, 500)

  const [inputCurrency, setInputCurrency] = useState(Tokens['DEUS'][chainId ?? SupportedChainId.BSC])
  const [outputCurrency, setOutputCurrency] = useState(Tokens['AxlDEUS'][chainId ?? SupportedChainId.BSC])

  const inputBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputBalance, inputAmount])

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useBridgeCallback(inputCurrency, inputAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingBridgeConfirmation, setAwaitingBridgeConfirmation] = useState<boolean>(false)

  const AxlGatewayContract = useAxlGatewayContract()
  const spender = useMemo(() => AxlGatewayContract?.address, [AxlGatewayContract])

  const currencyBalances = useCurrencyBalances(spender, [inputCurrency, outputCurrency])

  const [inputCurrencyBalanceDisplay, outputCurrencyBalanceDisplay] = useMemo(() => {
    return [currencyBalances[0]?.toSignificant(8), currencyBalances[1]?.toSignificant(8)]
  }, [currencyBalances])

  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    console.log(swapCallbackState, swapCallbackError)
    if (!swapCallback) return
    try {
      setAwaitingBridgeConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingBridgeConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingBridgeConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [swapCallbackState, swapCallback, swapCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
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
    } else if (showApprove) {
      return <MainButton onClick={handleApprove}>Allow us to spend {inputCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (showApprove) {
      return null
    } else if (insufficientBalance) {
      return <MainButton disabled>Insufficient {inputCurrency?.symbol} Balance</MainButton>
    } else if (awaitingBridgeConfirmation) {
      return (
        <MainButton>
          Swapping <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleSwap()}>Swap</MainButton>
  }

  useEffect(() => {
    if (chainId) {
      if (!reversed) {
        setInputCurrency(Tokens['DEUS'][chainId])
        setOutputCurrency(Tokens['AxlDEUS'][chainId])
      } else {
        setInputCurrency(Tokens['AxlDEUS'][chainId])
        setOutputCurrency(Tokens['DEUS'][chainId])
      }
    }
  }, [chainId])

  return (
    <Wrapper>
      <MigrationHeader />

      <InputBox currency={inputCurrency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />

      {inputCurrency?.symbol === DEUS_TOKEN.symbol ? (
        <RefreshCw
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setInputCurrency(outputCurrency)
            setOutputCurrency(inputCurrency)
            setReversed((prev) => !prev)
          }}
        />
      ) : (
        <RefreshCcw
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setInputCurrency(outputCurrency)
            setOutputCurrency(inputCurrency)
            setReversed((prev) => !prev)
          }}
        />
      )}

      <InputBox
        currency={outputCurrency}
        value={debouncedAmountIn}
        onChange={(value: string) => console.log(value)}
        disabled
      />

      {chainId && chainId !== SupportedChainId.FANTOM && isSupportedChain(chainId) && (
        <React.Fragment>
          <div style={{ marginTop: '20px' }} />
          <span style={{ fontSize: '13px' }}>
            {ChainInfo[chainId]?.label} Chain Pool: {inputCurrencyBalanceDisplay ?? 'N/A'} {inputCurrency?.symbol} /{' '}
            {outputCurrencyBalanceDisplay ?? 'N/A'} {outputCurrency?.symbol}
            <ExternalLink href="https://docs.deus.finance/bridge/how-to-bridge">
              <ExternalLinkIcon />
            </ExternalLink>
          </span>
        </React.Fragment>
      )}

      <div style={{ marginTop: '60px' }}></div>
      {getApproveButton()}
      {getActionButton()}
    </Wrapper>
  )
}
