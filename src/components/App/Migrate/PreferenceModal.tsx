import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { DotFlashing } from 'components/Icons'
import { MigrationButton } from './MigrationCard'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useChangePreferenceCallback } from 'hooks/useMigrateCallback'
import { IMigrationInfo, ModalType } from './MigratedTable'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ChainInfo } from 'constants/chainInfo'
import { Token } from '@sushiswap/core-sdk'
import { Row } from 'components/Row'
import BigNumber from 'bignumber.js'
import MigrationBox from './MigrationBox'
import MigrationBox2 from './MigrationBox2'
import { MigrationType } from './Table'

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

export enum MigrationBoxType {
  First,
  Second,
}

export default function PreferenceModal({
  isOpen,
  toggleModal,
  migrationInfo,
  token,
  modalType,
  migratedToDEUS,
  isEarly,
  // migratedToSYMM,
  calculatedSymmPerDeus,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  migrationInfo: IMigrationInfo
  token: Token
  modalType: ModalType
  migratedToDEUS: BigNumber
  isEarly: boolean
  // migratedToSYMM: BigNumber
  calculatedSymmPerDeus: BigNumber
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const tokenChain = token?.chainId
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [selected, setSelected] = useState(null)

  const {
    state: changePreferenceMigrateCallbackState,
    callback: changePreferenceMigrateCallback,
    error: changePreferenceMigrateCallbackError,
  } = useChangePreferenceCallback(migrationInfo?.indexInChain, getPreferenceStatus()[selected ?? 0])

  const handleChangePreferenceMigrate = useCallback(async () => {
    console.log('called handleChangePreferenceMigrate')
    console.log(changePreferenceMigrateCallbackState, changePreferenceMigrateCallbackError)
    if (!changePreferenceMigrateCallback) return
    try {
      setAwaitingConfirmation(true)
      const txHash = await changePreferenceMigrateCallback()
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
  }, [
    toggleModal,
    changePreferenceMigrateCallback,
    changePreferenceMigrateCallbackError,
    changePreferenceMigrateCallbackState,
  ])

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
    } else if (selected === null) return <ModalMigrationButton disabled>Select a new plan</ModalMigrationButton>
    else if (awaitingConfirmation) {
      return (
        <ModalMigrationButton migrationStatus="full_symm">
          Confirming <DotFlashing />
        </ModalMigrationButton>
      )
    }
    return (
      <ModalMigrationButton migrationStatus="full_symm" onClick={() => handleChangePreferenceMigrate()}>
        Confirm New Plan
      </ModalMigrationButton>
    )
  }

  function getPreferenceStatus() {
    const pref = migrationInfo?.migrationPreference
    if (pref === MigrationType.BALANCED) return [MigrationType.DEUS, MigrationType.SYMM]
    else if (pref === MigrationType.DEUS) return [MigrationType.BALANCED, MigrationType.SYMM]
    else return [MigrationType.DEUS, MigrationType.BALANCED]
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={modalType} border={false} />

      <Separator />
      <FromWrapper>
        <MigrationBox
          migrationPreference={migrationInfo?.migrationPreference}
          migratedToDEUS={migratedToDEUS}
          // migratedToSYMM={migratedToSYMM}
          calculatedSymmPerDeus={calculatedSymmPerDeus}
        />
        <Row>Select New Plan</Row>
        <MigrationBox2
          id={MigrationBoxType.First}
          migrationPreference={getPreferenceStatus()[MigrationBoxType.First]}
          token={token}
          amount={migrationInfo?.amount}
          isEarly={isEarly}
          selected={selected === MigrationBoxType.First}
          setSelected={setSelected}
        />
        <MigrationBox2
          id={MigrationBoxType.Second}
          migrationPreference={getPreferenceStatus()[MigrationBoxType.Second]}
          token={token}
          amount={migrationInfo?.amount}
          isEarly={isEarly}
          selected={selected === MigrationBoxType.Second}
          setSelected={setSelected}
        />
      </FromWrapper>

      {getActionButton()}
    </MainModal>
  )
}
