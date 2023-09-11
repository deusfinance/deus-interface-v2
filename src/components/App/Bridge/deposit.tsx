import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Plus } from 'react-feather'

import { Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import { SupportedChainId } from 'constants/chains'
import { useBridgeContract } from 'hooks/useContract'
import { useDepositCallback } from 'hooks/useBridgeCallback'
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

export default function DepositPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
  const [amountIn2, setAmountIn2] = useState('')

  const [inputCurrency, setInputCurrency] = useState(Tokens['DEUS'][chainId ?? SupportedChainId.BSC])
  const [outputCurrency, setOutputCurrency] = useState(Tokens['AxlDEUS'][chainId ?? SupportedChainId.BSC])

  const inputBalance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const inputBalance2 = useCurrencyBalance(account ?? undefined, outputCurrency)

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputBalance, inputAmount])

  const inputAmount2 = useMemo(() => {
    return tryParseAmount(amountIn2, outputCurrency || undefined)
  }, [amountIn2, outputCurrency])

  const insufficientBalance2 = useMemo(() => {
    if (!inputAmount2) return false
    return inputBalance2?.lessThan(inputAmount2)
  }, [inputBalance2, inputAmount2])

  const {
    state: depositCallbackState,
    callback: depositCallback,
    error: depositCallbackError,
  } = useDepositCallback(inputCurrency, inputAmount, outputCurrency, inputAmount2)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingBridgeConfirmation, setAwaitingBridgeConfirmation] = useState<boolean>(false)

  const BridgeContract = useBridgeContract()
  const spender = useMemo(() => BridgeContract?.address, [BridgeContract])

  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)
  const [approvalState2, approveCallback2] = useApproveCallback(outputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!Number(amountIn)
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amountIn])

  const [showApprove2, showApproveLoader2] = useMemo(() => {
    const show = outputCurrency && approvalState2 !== ApprovalState.APPROVED && !!Number(amountIn2)
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [outputCurrency, approvalState2, amountIn2])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove2 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback2()
    setAwaitingApproveConfirmation(false)
  }

  const handleDeposit = useCallback(async () => {
    console.log('called handleDeposit')
    console.log(depositCallbackState, depositCallbackError)
    if (!depositCallback) return
    try {
      setAwaitingBridgeConfirmation(true)
      const txHash = await depositCallback()
      setAwaitingBridgeConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingBridgeConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [depositCallbackState, depositCallback, depositCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    } else if (showApproveLoader || showApproveLoader2) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    } else if (showApprove) {
      return <MainButton onClick={handleApprove}>Allow us to spend {inputCurrency?.symbol}</MainButton>
    } else if (showApprove2) {
      return <MainButton onClick={handleApprove2}>Allow us to spend {outputCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (showApprove || showApprove2) {
      return null
    } else if (insufficientBalance) {
      return <MainButton disabled>Insufficient {inputCurrency?.symbol} Balance</MainButton>
    } else if (insufficientBalance2) {
      return <MainButton disabled>Insufficient {outputCurrency?.symbol} Balance</MainButton>
    } else if (awaitingBridgeConfirmation) {
      return (
        <MainButton>
          Depositing <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleDeposit()}>Deposit</MainButton>
  }

  return (
    <Wrapper>
      <MigrationHeader />

      <InputBox currency={inputCurrency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
      <Plus />
      <InputBox currency={outputCurrency} value={amountIn2} onChange={(value: string) => setAmountIn2(value)} />

      <div style={{ marginTop: '60px' }}></div>

      {getApproveButton()}
      {getActionButton()}
    </Wrapper>
  )
}
