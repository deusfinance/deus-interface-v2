import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'
import { veDEUS } from 'constants/addresses'
import { formatBalance, toBN } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import veDEUS_LOGO from '/public/static/images/pages/veDEUS/veDEUS.svg'

import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVeDeusMigratorContract } from 'hooks/useContract'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import { useWeb3React } from '@web3-react/core'

import { Modal, ModalHeader } from 'components/Modal'
import { PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import UserLockInformation from './UserLockInformation'
import { ButtonText } from 'components/App/Vest'
import { CustomInputBox } from 'components/InputBox'

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
  deusAmounts,
  migrationAmounts,
  isOpen,
  onDismiss,
}: {
  nftIds: number[]
  deusAmounts: string[]
  migrationAmounts: string[]
  isOpen: boolean
  onDismiss: () => void
}) {
  const onDismissProxy = () => {
    onDismiss()
  }

  return (
    <StyledModal isOpen={isOpen} onBackgroundClick={onDismissProxy} onEscapeKeydown={onDismissProxy}>
      <ModalHeader title={`Migrate ALL to xDEUS`} border onClose={onDismissProxy} />
      <ModalInnerWrapper>
        <IncreaseAmount nftIds={nftIds} deusAmounts={deusAmounts} migrationAmounts={migrationAmounts} />
      </ModalInnerWrapper>
    </StyledModal>
  )
}

function IncreaseAmount({
  nftIds,
  deusAmounts,
  migrationAmounts,
}: {
  nftIds: number[]
  migrationAmounts: string[]
  deusAmounts: string[]
}) {
  const { chainId } = useWeb3React()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)

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

  const migrationAmount = useMemo(() => {
    if (!nftList.length) return '0'
    let s = 0
    migrationAmounts.slice(0, nftList.length).forEach((amount) => {
      s += Number(amount)
    })
    return formatBalance(s)
  }, [nftList, migrationAmounts])

  const vestAmount = useMemo(() => {
    if (!nftList.length) return '0'
    let s = 0
    deusAmounts.slice(0, nftList.length).forEach((amount) => {
      s += Number(amount)
    })
    return formatBalance(s)
  }, [nftList, deusAmounts])

  const INSUFFICIENT_BALANCE = useMemo(() => {
    if (!count || Number(count) === 0) return false
    return toBN(MAX_COUNT).lt(count)
  }, [MAX_COUNT, count])

  const spender = useMemo(() => veDEUSMigratorContract?.address, [veDEUSMigratorContract])
  const [approvalState, approveCallback] = useERC721ApproveAllCallback(chainId ? veDEUS[chainId] : undefined, spender)
  const showApprove = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const onLock = useCallback(async () => {
    try {
      if (!count || Number(count) === 0 || !nftList.length || !veDEUSMigratorContract) return
      setAwaitingConfirmation(true)
      const response = await veDEUSMigratorContract.migrateAllVeDEUSToVDEUS(nftList)
      addTransaction(response, { summary: `Migrate ${count} veDEUS NFT to ${migrationAmount} xDEUS` })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [count, migrationAmount, nftList, veDEUSMigratorContract, addTransaction])

  return (
    <>
      <CustomInputBox
        name={'veDEUS NFT Count'}
        value={count}
        onChange={setCount}
        balanceDisplay={MAX_COUNT}
        balanceExact={MAX_COUNT}
        placeholder="Enter NFT Count"
        icon={veDEUS_LOGO}
      />
      <UserLockInformation
        vestAmount={vestAmount}
        migrationAmount={migrationAmount}
        title="Review Migration:"
        nftList={nftList}
      />
      {INSUFFICIENT_BALANCE ? (
        <PrimaryButtonWide>
          <ButtonModalText>INSUFFICIENT BALANCE</ButtonModalText>
        </PrimaryButtonWide>
      ) : awaitingConfirmation || awaitingApproveConfirmation ? (
        <PrimaryButtonWide>
          <ButtonModalText>
            Awaiting Confirmation <DotFlashing />
          </ButtonModalText>
        </PrimaryButtonWide>
      ) : showApprove ? (
        <PrimaryButtonWide onClick={handleApprove}>
          <ButtonModalText>Approve NFT</ButtonModalText>
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
