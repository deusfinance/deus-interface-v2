import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'
import { veDEUS } from 'constants/addresses'
import { DefaultHandlerError } from 'utils/parseError'

import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVeDeusMigratorContract } from 'hooks/useContract'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import useWeb3React from 'hooks/useWeb3'

import { Modal, ModalHeader } from 'components/Modal'
import { PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import UserLockInformation from './UserLockInformation'

const StyledModal = styled(Modal)`
  overflow: visible; // date picker needs an overflow
`

export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #0badf4 -10.26%, #30efe4 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
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

export default function MigrateSingleNFT({
  nftId,
  deusAmount,
  migrationAmount,
  isOpen,
  onDismiss,
}: {
  nftId: number
  deusAmount: string
  migrationAmount: string
  isOpen: boolean
  onDismiss: () => void
}) {
  const onDismissProxy = () => {
    onDismiss()
  }

  const { chainId } = useWeb3React()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)

  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useHasPendingVest(pendingTxHash)
  const addTransaction = useTransactionAdder()

  const veDEUSMigratorContract = useVeDeusMigratorContract()

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
      if (!nftId || !veDEUSMigratorContract) return
      setAwaitingConfirmation(true)
      const response = await veDEUSMigratorContract.migrateVeDEUSToVDEUS(nftId)
      addTransaction(response, { summary: `Migrate #${nftId} to ${migrationAmount} vDEUS` })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [veDEUSMigratorContract, nftId, migrationAmount, addTransaction])

  return (
    <StyledModal isOpen={isOpen} onBackgroundClick={onDismissProxy} onEscapeKeydown={onDismissProxy}>
      <ModalHeader title={`Migrate to vDEUS`} border onClose={onDismissProxy} />
      <ModalInnerWrapper>
        <>
          <UserLockInformation
            vestAmount={deusAmount}
            migrationAmount={migrationAmount}
            nftList={[nftId]}
            single={true}
          />
          {awaitingConfirmation || awaitingApproveConfirmation ? (
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
              <ButtonModalText>Migrate #{nftId}</ButtonModalText>
            </PrimaryButtonWide>
          )}
        </>
      </ModalInnerWrapper>
    </StyledModal>
  )
}
