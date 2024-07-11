import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { RefreshCcw, RefreshCw } from 'react-feather'

import { DEUS_TOKEN, DEUS_TOKEN_FTM, Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance, useCurrencyBalances } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { ApprovalState, useApproveCallbackWithAmount } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import { SupportedChainId } from 'constants/chains'
import { useAxlGatewayContract, useMetaBridgeGatewayContract } from 'hooks/useContract'
import useBridgeCallback, { useMetaBridgeCallback } from 'hooks/useBridgeCallback'
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
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
  const [reversed, setReversed] = useState(false)
  const debouncedAmountIn = useDebounce(amountIn, 500)

  const [inputCurrency, setInputCurrency] = useState(
    chainId && chainId === SupportedChainId.FANTOM
      ? DEUS_TOKEN_FTM
      : chainId === SupportedChainId.BSC_TESTNET
      ? Tokens['EERC'][SupportedChainId.BSC_TESTNET]
      : Tokens['DEUS'][chainId ?? SupportedChainId.BSC]
  )
  const [outputCurrency, setOutputCurrency] = useState(
    chainId && chainId === SupportedChainId.BSC_TESTNET
      ? Tokens['DEUS_OFT'][SupportedChainId.BSC_TESTNET]
      : Tokens['AxlDEUS'][chainId ?? SupportedChainId.BSC]
  )

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

  const {
    state: metaSwapCallbackState,
    callback: metaSwapCallback,
    error: metaSwapCallbackError,
  } = useMetaBridgeCallback(inputCurrency, inputAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingBridgeConfirmation, setAwaitingBridgeConfirmation] = useState<boolean>(false)

  const axlGatewayContract = useAxlGatewayContract()
  const metaBridgeGatewayContract = useMetaBridgeGatewayContract()
  const spender = useMemo(
    () => (chainId === SupportedChainId.BSC_TESTNET ? metaBridgeGatewayContract?.address : axlGatewayContract?.address),
    [axlGatewayContract?.address, chainId, metaBridgeGatewayContract]
  )

  const currencyBalances = useCurrencyBalances(spender, [inputCurrency, outputCurrency])

  const [inputCurrencyBalanceDisplay, outputCurrencyBalanceDisplay] = useMemo(() => {
    return [currencyBalances[0]?.toSignificant(8), currencyBalances[1]?.toSignificant(8)]
  }, [currencyBalances])

  const [approvalState, approveCallback] = useApproveCallbackWithAmount(
    inputCurrency ?? undefined,
    spender,
    amountIn,
    true
  )
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

  const handleMetaBridgeSwap = useCallback(async () => {
    console.log('called handleMetaBridgeSwap')
    console.log(metaSwapCallbackState, metaSwapCallbackError)
    if (!metaSwapCallback) return
    try {
      setAwaitingBridgeConfirmation(true)
      const txHash = await metaSwapCallback()
      setAwaitingBridgeConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingBridgeConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [metaSwapCallbackState, metaSwapCallbackError, metaSwapCallback])

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
    return (
      <MainButton onClick={() => (chainId === SupportedChainId.BSC_TESTNET ? handleMetaBridgeSwap() : handleSwap())}>
        Swap
      </MainButton>
    )
  }

  useEffect(() => {
    if (chainId && chainId !== SupportedChainId.BSC_TESTNET) {
      if (!reversed) {
        if (chainId !== SupportedChainId.FANTOM) setInputCurrency(Tokens['DEUS'][chainId])
        else setInputCurrency(DEUS_TOKEN_FTM)
        setOutputCurrency(Tokens['AxlDEUS'][chainId])
      } else {
        setInputCurrency(Tokens['AxlDEUS'][chainId])
        if (chainId !== SupportedChainId.FANTOM) setOutputCurrency(Tokens['DEUS'][chainId])
        else setOutputCurrency(DEUS_TOKEN_FTM)
      }
    } else if (chainId && chainId === SupportedChainId.BSC_TESTNET) {
      if (!reversed) {
        setInputCurrency(Tokens['EERC'][chainId])
        setOutputCurrency(Tokens['DEUS_OFT'][chainId])
      } else {
        setInputCurrency(Tokens['DEUS_OFT'][chainId])
        setOutputCurrency(Tokens['EERC'][chainId])
      }
    }
  }, [chainId, reversed])

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

      {chainId && (
        <React.Fragment>
          <div style={{ marginTop: '20px' }} />
          <span style={{ fontSize: '13px' }}>
            {ChainInfo[chainId].label} Chain Pool: {inputCurrencyBalanceDisplay ?? 'N/A'} {inputCurrency.symbol} /{' '}
            {outputCurrencyBalanceDisplay ?? 'N/A'} {outputCurrency.symbol}
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
