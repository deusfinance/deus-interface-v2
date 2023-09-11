import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Plus } from 'react-feather'

import { Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useToggleWalletModal } from 'state/application/hooks'
import { useWeb3React } from '@web3-react/core'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import { SupportedChainId } from 'constants/chains'
import { useWithdrawCallback } from 'hooks/useBridgeCallback'
import MigrationHeader from './MigrationHeader'
import { useDeposits } from 'hooks/useBridgePage'
import { toBN } from 'utils/numbers'

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

export default function WithdrawPage() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useToggleWalletModal()

  const deposits = useDeposits()
  const [amountIn, setAmountIn] = useState('')
  const [amountIn2, setAmountIn2] = useState('')

  const [inputCurrency, setInputCurrency] = useState(Tokens['DEUS'][chainId ?? SupportedChainId.BSC])
  const [outputCurrency, setOutputCurrency] = useState(Tokens['AxlDEUS'][chainId ?? SupportedChainId.BSC])

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const inputAmount2 = useMemo(() => {
    return tryParseAmount(amountIn2, outputCurrency || undefined)
  }, [amountIn2, outputCurrency])

  const {
    state: withdrawCallbackState,
    callback: withdrawCallback,
    error: withdrawCallbackError,
  } = useWithdrawCallback(inputCurrency, inputAmount, outputCurrency, inputAmount2)

  const [awaitingBridgeConfirmation, setAwaitingBridgeConfirmation] = useState<boolean>(false)

  const handleWithdraw = useCallback(async () => {
    console.log('called handleWithdraw')
    console.log(withdrawCallbackState, withdrawCallbackError)
    if (!withdrawCallback) return
    try {
      setAwaitingBridgeConfirmation(true)
      const txHash = await withdrawCallback()
      setAwaitingBridgeConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingBridgeConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [withdrawCallbackState, withdrawCallback, withdrawCallbackError])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (awaitingBridgeConfirmation) {
      return (
        <MainButton>
          Withdrawing <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleWithdraw()}>Withdraw</MainButton>
  }

  return (
    <Wrapper>
      <MigrationHeader />

      <InputBox
        currency={inputCurrency}
        value={amountIn}
        onChange={(value: string) => setAmountIn(value)}
        hideBalance
      />
      <Plus />
      <InputBox
        currency={outputCurrency}
        value={amountIn2}
        onChange={(value: string) => setAmountIn2(value)}
        hideBalance
      />

      <div style={{ margin: '45px auto' }}>
        {deposits && <p>Total amount to withdraw: {toBN(deposits.toString()).div(1e18).toFixed(6)}</p>}
      </div>

      {getActionButton()}
    </Wrapper>
  )
}
