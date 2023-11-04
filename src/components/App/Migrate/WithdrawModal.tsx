import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { DotFlashing } from 'components/Icons'
import { MigrationButton } from './MigrationCard'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useUndoCallback } from 'hooks/useMigrateCallback'
import InputBox from './InputBox'
import { IMigrationInfo } from './MigratedTable'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ChainInfo } from 'constants/chainInfo'
import { Token } from '@sushiswap/core-sdk'

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
  margin-top: 15px;
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
      : 'transparent'};
  filter: ${({ insufficientBalance }) => insufficientBalance && 'brightness(1.5)'};
`

export default function WithdrawModal({
  isOpen,
  toggleModal,
  migrationInfo,
  token,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  migrationInfo: IMigrationInfo
  token: Token
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const chain = token?.chainId
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)

  const {
    state: undoMigrateCallbackState,
    callback: undoMigrateCallback,
    error: undoMigrateCallbackError,
  } = useUndoCallback(migrationInfo?.indexInChain)

  const handleUndoMigrate = useCallback(async () => {
    console.log('called handleUndoMigrate')
    console.log(undoMigrateCallbackState, undoMigrateCallbackError)
    if (!undoMigrateCallback) return
    try {
      setAwaitingMigrateConfirmation(true)
      const txHash = await undoMigrateCallback()
      setAwaitingMigrateConfirmation(false)
      toggleModal(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingMigrateConfirmation(false)
      toggleModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [toggleModal, undoMigrateCallback, undoMigrateCallbackError, undoMigrateCallbackState])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ModalMigrationButton onClick={toggleWalletModal}>Connect Wallet</ModalMigrationButton>
    } else if (chain !== chainId) {
      return (
        <ModalMigrationButton
          style={{ background: ChainInfo[chain].color }}
          onClick={() => rpcChangerCallback(Number(ChainInfo[chain].chainId))}
        >
          Switch to {ChainInfo[chain].chainName}
        </ModalMigrationButton>
      )
    } else if (awaitingMigrateConfirmation) {
      return (
        <ModalMigrationButton solidOrange>
          Withdrawing <DotFlashing />
        </ModalMigrationButton>
      )
    }
    return (
      <ModalMigrationButton solidOrange onClick={() => handleUndoMigrate()}>
        Cancel Migration & Withdraw {token.symbol}
      </ModalMigrationButton>
    )
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={'Withdraw'} border={false} />

      <Separator />

      <FromWrapper>
        <InputBox
          currency={token}
          hideBalance
          disabled
          value={(migrationInfo?.amount * 1e-18).toString()}
          onChange={() => console.log()}
        />
      </FromWrapper>

      {getActionButton()}
    </MainModal>
  )
}
