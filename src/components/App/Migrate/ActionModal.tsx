import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { DotFlashing } from 'components/Icons'
import { MigrationButton } from './MigrationCard'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useSplitCallback, useUndoCallback } from 'hooks/useMigrateCallback'
import InputBox from './InputBox'
import { IMigrationInfo, ModalType } from './MigratedTable'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ChainInfo } from 'constants/chainInfo'
import { Token } from '@sushiswap/core-sdk'
import { Row } from 'components/Row'
import { tryParseAmount } from 'utils/parse'

const MainModal = styled(Modal)`
  display: flex;
  font-family: Inter;
  width: 454px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
  `};
`

const FromWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 20px;
  gap: 15px;
  margin-top: 10px;
  margin-bottom: 20px;

  & > * {
    color: #f1f1f1;
    font-size: 14px;

    &:nth-child(1) {
      color: ${({ theme }) => theme.text5};
      font-size: 12px;
    }
  }
`

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bg3};
`

export const ModalMigrationButton = styled(MigrationButton)<{ insufficientBalance?: boolean; solidOrange?: boolean }>`
  width: 93%;
  margin: 15px auto;
  background: ${({ insufficientBalance, solidOrange }) =>
    insufficientBalance
      ? 'linear-gradient(90deg, #B5BEC2 0%, #4F5B5B 93.41%)'
      : solidOrange
      ? '#E96034'
      : 'linear-gradient(270deg, #D4FDF9 0%, #D7C7C1 23.44%, #D9A199 41.15%, #F095A2 57.81%, #FFA097 81.25%, #D5EEE9 99.99%)'};
  filter: ${({ insufficientBalance }) => insufficientBalance && 'brightness(1.2)'};
`

export default function ActionModal({
  isOpen,
  toggleModal,
  migrationInfo,
  token,
  modalType,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  migrationInfo: IMigrationInfo
  token: Token
  modalType: ModalType
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const tokenChain = token?.chainId
  const migrationAmount = (migrationInfo?.amount * 1e-18).toString()

  const [amountIn, setAmountIn] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const isWithdraw = modalType === ModalType.WITHDRAW,
    isSplit = modalType === ModalType.SPLIT

  const [inputAmount, inputBalance] = useMemo(() => {
    return [tryParseAmount(amountIn, token || undefined), tryParseAmount(migrationAmount, token || undefined)]
  }, [amountIn, migrationAmount, token])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(inputAmount)
  }, [inputAmount, inputBalance])

  const {
    state: undoMigrateCallbackState,
    callback: undoMigrateCallback,
    error: undoMigrateCallbackError,
  } = useUndoCallback(migrationInfo?.indexInChain)

  const {
    state: splitMigrateCallbackState,
    callback: splitMigrateCallback,
    error: splitMigrateCallbackError,
  } = useSplitCallback(migrationInfo?.indexInChain, inputAmount)

  const handleUndoMigrate = useCallback(async () => {
    console.log('called handleUndoMigrate')
    console.log(undoMigrateCallbackState, undoMigrateCallbackError)
    if (!undoMigrateCallback) return
    try {
      setAwaitingConfirmation(true)
      const txHash = await undoMigrateCallback()
      setAwaitingConfirmation(false)
      toggleModal(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingConfirmation(false)
      toggleModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [toggleModal, undoMigrateCallback, undoMigrateCallbackError, undoMigrateCallbackState])

  const handleSplitMigrate = useCallback(async () => {
    console.log('called handleSplitMigrate')
    console.log(splitMigrateCallbackState, splitMigrateCallbackError)
    if (!splitMigrateCallback) return
    try {
      setAwaitingConfirmation(true)
      const txHash = await splitMigrateCallback()
      setAwaitingConfirmation(false)
      toggleModal(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingConfirmation(false)
      toggleModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [splitMigrateCallback, splitMigrateCallbackError, splitMigrateCallbackState, toggleModal])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ModalMigrationButton onClick={toggleWalletModal}>Connect Wallet</ModalMigrationButton>
    } else if (tokenChain !== chainId) {
      return (
        <ModalMigrationButton
          style={{ background: ChainInfo[tokenChain].color }}
          onClick={() => rpcChangerCallback(Number(ChainInfo[tokenChain].chainId))}
        >
          Switch to {ChainInfo[tokenChain].label}
        </ModalMigrationButton>
      )
    } else if (insufficientBalance) {
      return (
        <ModalMigrationButton disabled insufficientBalance>
          Amount Exceeds Limit
        </ModalMigrationButton>
      )
    } else if (awaitingConfirmation) {
      return (
        <ModalMigrationButton solidOrange={isWithdraw}>
          {isWithdraw ? 'Withdrawing' : 'Splitting'} <DotFlashing />
        </ModalMigrationButton>
      )
    } else if (isSplit) return <ModalMigrationButton onClick={() => handleSplitMigrate()}>Split</ModalMigrationButton>
    return (
      <ModalMigrationButton solidOrange onClick={() => handleUndoMigrate()}>
        Cancel Migration & Withdraw {token.symbol}
      </ModalMigrationButton>
    )
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={modalType} border={false} />

      <Separator />
      <FromWrapper>
        {isSplit && <Row>Split Amount</Row>}
        <InputBox
          currency={token}
          hideBalance={isWithdraw}
          disabled={isWithdraw}
          maxValue={isWithdraw ? null : migrationAmount}
          value={isWithdraw ? migrationAmount : amountIn}
          onChange={isWithdraw ? () => null : (value: string) => setAmountIn(value)}
        />
      </FromWrapper>

      {getActionButton()}
    </MainModal>
  )
}
