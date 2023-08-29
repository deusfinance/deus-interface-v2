import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { DEUS_TOKEN, XDEUS_TOKEN } from 'constants/tokens'
import { StablePools } from 'constants/sPools'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useSwapCallback from 'hooks/useSwapCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import AdvancedOptions from './AdvancedOptions'
import InputBox from './InputBox'
import { LiquidityPool } from 'constants/stakingPools'

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
    &:nth-child(2) {
      margin: 15px auto;
    }
    &:nth-child(6) {
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
  const [slippage, setSlippage] = useState(0.5)
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const [inputCurrency, setInputCurrency] = useState(DEUS_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState(XDEUS_TOKEN)

  //get stable pool info
  const pool = StablePools[0]
  const liquidityPool = LiquidityPool[0]
  const inputBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  //todo fix me in dei bond
  const { amountOut } = useSwapAmountsOut(debouncedAmountIn, inputCurrency, outputCurrency, pool)

  // Amount typed in either fields
  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const outputAmount = useMemo(() => {
    return tryParseAmount(amountOut, outputCurrency || undefined)
  }, [amountOut, outputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputBalance, inputAmount])

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useSwapCallback(inputCurrency, outputCurrency, inputAmount, outputAmount, pool, slippage, 20)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId && pool ? pool.swapFlashLoan : undefined), [chainId, pool])
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
      setAwaitingRedeemConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
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
    } else if (awaitingRedeemConfirmation) {
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
      <InputBox
        currency={inputCurrency}
        value={amountIn}
        onChange={(value: string) => setAmountIn(value)}
        title={'From'}
        disable_vdeus
      />
      <ArrowDown
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setInputCurrency(outputCurrency)
          setOutputCurrency(inputCurrency)
        }}
      />

      <InputBox
        currency={outputCurrency}
        value={amountOut}
        onChange={(value: string) => console.log(value)}
        title={'To'}
        disabled={true}
        disable_vdeus
      />
      <div style={{ marginTop: '20px' }}></div>
      {getApproveButton()}
      {getActionButton()}
      <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
    </Wrapper>
  )
}
