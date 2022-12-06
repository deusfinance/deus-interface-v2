import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVeDeusMigratorContract } from 'hooks/useContract'

import { Modal, ModalHeader } from 'components/Modal'
import { PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import UserLockInformation from './UserLockInformation'
import { ButtonText } from 'components/App/Vest'
import { toBN } from 'utils/numbers'
import { CustomInputBox } from 'components/InputBox'
import { DefaultHandlerError } from 'utils/parseError'

const StyledModal = styled(Modal)`
  overflow: visible; // date picker needs an overflow
`

const ButtonModalText = styled(ButtonText)`
  color: ${({ theme }) => theme.black} !important;
`

const ModalInnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 20px;
  padding: 1rem;
  & > * {
    &:nth-last-child(3) {
      margin-top: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.8rem;
  `}
`

export default function MigrateAllManager({
  nftIds,
  isOpen,
  onDismiss,
}: {
  nftIds: number[]
  isOpen: boolean
  onDismiss: () => void
}) {
  function getMainContent() {
    return <IncreaseAmount nftIds={nftIds} />
  }

  const onDismissProxy = () => {
    onDismiss()
  }

  return (
    <StyledModal isOpen={isOpen} onBackgroundClick={onDismissProxy} onEscapeKeydown={onDismissProxy}>
      <ModalHeader title={`Migrate All`} border onClose={onDismissProxy} />
      <ModalInnerWrapper>{getMainContent()}</ModalInnerWrapper>
    </StyledModal>
  )
}

function IncreaseAmount({ nftIds }: { nftIds: number[] }) {
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useHasPendingVest(pendingTxHash)
  const addTransaction = useTransactionAdder()

  const veDEUSMigratorContract = useVeDeusMigratorContract()
  const [count, setCount] = useState('')
  const MAX_COUNT = useMemo(() => (nftIds ? nftIds.length : 0), [nftIds])
  const nftList = useMemo(() => {
    if (!count) return []
    const size = MAX_COUNT < Number(count) ? MAX_COUNT : Number(count)
    return nftIds.slice(0, size)
  }, [nftIds, count, MAX_COUNT])
  const vestAmount = '80'
  const migrationAmount = '100'

  const INSUFFICIENT_BALANCE = useMemo(() => {
    if (!count || Number(count) === 0) return false
    return toBN(MAX_COUNT).lt(count)
  }, [MAX_COUNT, count])

  const onLock = useCallback(async () => {
    try {
      if (!count || Number(count) === 0 || !nftList.length || !veDEUSMigratorContract) return
      setAwaitingConfirmation(true)
      const response = await veDEUSMigratorContract.migrateAllVeDEUSToVDEUS(nftList)
      addTransaction(response, { summary: `Migrating ${count} veDEUS` })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [count, nftList, veDEUSMigratorContract, addTransaction])

  return (
    <>
      <CustomInputBox
        name={'veDEUS NFT Count'}
        value={count}
        onChange={setCount}
        balanceDisplay={MAX_COUNT}
        balanceExact={MAX_COUNT}
        placeholder="Enter NFT Count"
      />
      <UserLockInformation
        vestAmount={vestAmount}
        migrationAmount={migrationAmount}
        title="Review Migration:"
        nftList={nftList}
      />
      {INSUFFICIENT_BALANCE ? (
        <PrimaryButtonWide disabled>
          <ButtonModalText>INSUFFICIENT BALANCE</ButtonModalText>
        </PrimaryButtonWide>
      ) : awaitingConfirmation ? (
        <PrimaryButtonWide>
          <ButtonModalText>
            Awaiting Confirmation <DotFlashing />
          </ButtonModalText>
        </PrimaryButtonWide>
      ) : showTransactionPending ? (
        <PrimaryButtonWide>
          <ButtonModalText>
            Migrating <DotFlashing />
          </ButtonModalText>
        </PrimaryButtonWide>
      ) : (
        <PrimaryButtonWide onClick={onLock}>
          <ButtonModalText>Migrate All</ButtonModalText>
        </PrimaryButtonWide>
      )}
    </>
  )
}
