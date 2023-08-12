import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { RefreshCcw, RefreshCw } from 'react-feather'

import { DEUS_TOKEN, Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import { SupportedChainId } from 'constants/chains'
import { useBridgeContract } from 'hooks/useContract'
import useBridgeCallback from 'hooks/useBridgeCallback'
import MigrationHeader from './MigrationHeader'

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

export default function SwapPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
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

  const BridgeContract = useBridgeContract()
  const spender = useMemo(() => BridgeContract?.address, [BridgeContract])

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

  return (
    <Wrapper>
      <MigrationHeader />

      <InputBox currency={inputCurrency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
      {inputCurrency.symbol === DEUS_TOKEN.symbol ? (
        <RefreshCw
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setInputCurrency(outputCurrency)
            setOutputCurrency(inputCurrency)
          }}
        />
      ) : (
        <RefreshCcw
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setInputCurrency(outputCurrency)
            setOutputCurrency(inputCurrency)
          }}
        />
      )}
      <InputBox
        currency={outputCurrency}
        value={debouncedAmountIn}
        onChange={(value: string) => console.log(value)}
        disabled={true}
      />
      <div style={{ marginTop: '60px' }}></div>
      {getApproveButton()}
      {getActionButton()}
    </Wrapper>
  )
}