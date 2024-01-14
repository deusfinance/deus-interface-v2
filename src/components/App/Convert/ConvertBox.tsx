import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { DEUS_TOKEN_FTM, Tokens } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { ApprovalState, useApproveCallbackWithAmount } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox2'
import { useDeusConversionContract } from 'hooks/useContract'
import ConvertBoxHeader from './MigrationHeader'
import ArrowDownBox from 'components/Icons/ArrowDownBox'
import { useInitiateTokenConversionCallback } from 'hooks/useDeusConversionCallback'
import TokensModal from './TokensModal'
import { Token } from '@sushiswap/core-sdk'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`
const Wrapper = styled(Container)`
  width: clamp(250px, 75%, 500px);
  background-color: #1a1b1b;
  padding: 20px 15px;
  border-radius: 15px;
  justify-content: center;
  & > * {
    &:nth-child(3) {
      margin: 10px auto;
    }
  }
`
export const MainButton = styled(PrimaryButton)`
  border-radius: 12px;
`

export default function ConvertBox({ ConvertTokensList }: { ConvertTokensList: Token[] }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)

  const [inputCurrency, setInputCurrency] = useState(ConvertTokensList[0])
  const [outputCurrency, setOutputCurrency] = useState(DEUS_TOKEN_FTM)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingConvertConfirmation, setAwaitingConvertConfirmation] = useState(false)

  const [isTokensModalOpen, setTokensModalOpen] = useState(false)

  const inputBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputBalance, inputAmount])

  const {
    state: convertCallbackState,
    callback: convertCallback,
    error: convertCallbackError,
  } = useInitiateTokenConversionCallback(inputCurrency, inputAmount)

  const deusConversionContract = useDeusConversionContract()
  const spender = useMemo(() => deusConversionContract?.address, [deusConversionContract])

  const handleTokenSelect = (token: Token) => {
    setInputCurrency(token)
  }

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

  const handleConvert = useCallback(async () => {
    console.log('called handleConvert')
    console.log(convertCallbackState, convertCallbackError)
    if (!convertCallback) return
    try {
      setAwaitingConvertConfirmation(true)
      const txHash = await convertCallback()
      setAwaitingConvertConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingConvertConfirmation(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [convertCallback, convertCallbackError, convertCallbackState])

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
    } else if (awaitingConvertConfirmation) {
      return (
        <MainButton>
          Migrating <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleConvert()}>Migrate</MainButton>
  }

  useEffect(() => {
    if (chainId) {
      setInputCurrency(Tokens['DEUS'][chainId])
      setOutputCurrency(DEUS_TOKEN_FTM)
    }
  }, [chainId])

  return (
    <>
      <Wrapper>
        <ConvertBoxHeader />

        <InputBox
          currency={inputCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          onTokenSelect={() => {
            setTokensModalOpen(true)
          }}
        />

        <ArrowDownBox />

        <InputBox
          currency={outputCurrency}
          value={debouncedAmountIn}
          onChange={(value: string) => console.log(value)}
          disabled
        />

        <div style={{ marginTop: '60px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <TokensModal
        isOpen={isTokensModalOpen}
        selectedToken={inputCurrency}
        toggleModal={(action: boolean) => setTokensModalOpen(action)}
        setToken={(currency) => handleTokenSelect(currency as Token)}
        tokens={ConvertTokensList}
      />
    </>
  )
}
