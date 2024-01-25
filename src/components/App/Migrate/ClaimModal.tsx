import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import { DotFlashing } from 'components/Icons'
import { useMigratorContract } from 'hooks/useContract'
import { ApprovalState } from 'hooks/useApproveCallbacks'
import { useClaimCallback } from 'hooks/useMigrateCallback'
import { ModalMigrationButton } from './ManualReviewModal'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { toBN } from 'utils/numbers'
import { IMigrationInfo } from './MigratedTable'
import { useApproveCallbackWithAmount } from 'hooks/useApproveCallback'
import { ChainInfo } from 'constants/chainInfo'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

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

export default function ClaimModal({
  inputToken,
  migrationInfo,
  isOpen,
  toggleModal,
}: {
  inputToken: Token
  migrationInfo: IMigrationInfo
  isOpen: boolean
  toggleModal: (action: boolean) => void
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)

  const MigratorContract = useMigratorContract()
  const spender = useMemo(() => MigratorContract?.address, [MigratorContract])

  const amountIn = migrationInfo?.amount

  const amountToApprove = useMemo(() => {
    const amount = toBN(amountIn.toString()).div(1e18).toString()
    if (!amount || isNaN(Number(amount))) return '0'
    return amount
  }, [amountIn])

  const [approvalState, approveCallback] = useApproveCallbackWithAmount(inputToken, spender, amountToApprove, true)

  const tokenChain = inputToken?.chainId
  const rpcChangerCallback = useRpcChangerCallback()

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputToken && approvalState !== ApprovalState.APPROVED && !!Number(amountIn)
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputToken, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const {
    state: ClaimCallbackState,
    callback: ClaimCallback,
    error: ClaimCallbackError,
  } = useClaimCallback(inputToken, amountIn, migrationInfo?.indexInChain)

  const handleClaim = useCallback(async () => {
    console.log('called handleClaim')
    console.log(ClaimCallbackState, ClaimCallbackError)
    if (!ClaimCallback) return
    try {
      setAwaitingMigrateConfirmation(true)
      const txHash = await ClaimCallback()
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
  }, [ClaimCallbackState, ClaimCallbackError, ClaimCallback, toggleModal])

  function getApproveButton(): JSX.Element | null {
    if (!chainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <ModalMigrationButton>
          Awaiting Confirmation <DotFlashing />
        </ModalMigrationButton>
      )
    } else if (tokenChain !== chainId) {
      return (
        <ModalMigrationButton
          style={{ background: ChainInfo[tokenChain].color }}
          onClick={() => rpcChangerCallback(Number(ChainInfo[tokenChain].chainId))}
        >
          Switch to {ChainInfo[tokenChain].label}
        </ModalMigrationButton>
      )
    }
    if (showApproveLoader) {
      return (
        <ModalMigrationButton>
          Approving <DotFlashing />
        </ModalMigrationButton>
      )
    }
    if (showApprove) {
      return (
        <ModalMigrationButton onClick={() => handleApprove()}>
          Allow us to spend {inputToken?.symbol}
        </ModalMigrationButton>
      )
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account)
      return <ModalMigrationButton onClick={toggleWalletModal}>Connect Wallet</ModalMigrationButton>
    if (showApprove) return null

    if (awaitingMigrateConfirmation) {
      return (
        <ModalMigrationButton>
          Claiming
          <DotFlashing />
        </ModalMigrationButton>
      )
    }
    return <ModalMigrationButton onClick={() => handleClaim()}>Claim</ModalMigrationButton>
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={'Claim'} border={false} />

      {getApproveButton()}
      {getActionButton()}
    </MainModal>
  )
}
