import { useCallback, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk-core'

import { ModalHeader, Modal } from 'components/Modal'
import { Row } from 'components/Row'
import { DotFlashing } from 'components/Icons'
import { MigrationButton } from './MigrationCard'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useWeb3React } from '@web3-react/core'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { tryParseAmount } from 'utils/parse'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useMigratorContract } from 'hooks/useContract'
import { useToggleWalletModal } from 'state/application/hooks'
import useMigrateCallback from 'hooks/useMigrateCallback'
import { DEUS_TOKEN } from 'constants/tokens'
import InputBox from './InputBox'
import { ApprovalState } from 'lib/hooks/useApproval'
import { useApproveCallback } from 'lib/hooks/useApproveCallback'

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

export const ModalMigrationButton = styled(MigrationButton)<{ insufficientBalance?: boolean }>`
  width: 93%;
  margin: 15px auto;
  background: ${({ insufficientBalance }) =>
    insufficientBalance && 'linear-gradient(90deg, #B5BEC2 0%, #4F5B5B 93.41%)'};
  filter: ${({ insufficientBalance }) => insufficientBalance && 'brightness(1.5)'};
`

function getImageSize() {
  return isMobile ? 15 : 20
}

export default function ManualReviewModal({
  title,
  isOpen,
  inputToken,
  outputToken,
  buttonText,
  toggleModal,
  awaiting,
}: {
  title: string
  isOpen: boolean
  inputToken: Token | undefined
  outputToken: Token
  buttonText: string
  toggleModal: (action: boolean) => void
  awaiting: boolean
}) {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useToggleWalletModal()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function toggleReviewModal(arg: boolean) {
    toggleModal(arg)
    setAmountIn('')
  }

  const logo = useCurrencyLogo(outputToken?.address)
  const [amountIn, setAmountIn] = useState('')
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)

  const MigratorContract = useMigratorContract()
  const spender = useMemo(() => MigratorContract?.address, [MigratorContract])
  const [approvalState, approveCallback] = useApproveCallback(inputToken ?? undefined, amountIn, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputToken && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputToken, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const inputBalance = useCurrencyBalance(account ?? undefined, inputToken)

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, inputToken || undefined)
  }, [amountIn, inputToken])

  const {
    state: migrateCallbackState,
    callback: migrateCallback,
    error: migrateCallbackError,
  } = useMigrateCallback([inputToken], inputAmount && [inputAmount], [outputToken])

  const handleMigrate = useCallback(async () => {
    console.log('called handleMigrate')
    console.log(migrateCallbackState, migrateCallbackError)
    if (!migrateCallback) return
    try {
      setAwaitingMigrateConfirmation(true)
      const txHash = await migrateCallback()
      setAwaitingMigrateConfirmation(false)
      toggleReviewModal(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingMigrateConfirmation(false)
      toggleReviewModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [migrateCallbackState, migrateCallbackError, migrateCallback, toggleReviewModal])

  const migrationStatus = outputToken?.symbol === DEUS_TOKEN?.name ? 'full_deus' : 'full_symm'

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputBalance?.lessThan(amountIn)
  }, [inputAmount, inputBalance, amountIn])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Awaiting Confirmation <DotFlashing />
        </ModalMigrationButton>
      )
    } else if (showApproveLoader) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Approving <DotFlashing />
        </ModalMigrationButton>
      )
    } else if (showApprove) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus} onClick={handleApprove}>
          Allow us to spend {inputToken?.symbol}
        </ModalMigrationButton>
      )
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus} onClick={toggleWalletModal}>
          Connect Wallet
        </ModalMigrationButton>
      )
    } else if (showApprove) {
      return null
    } else if (insufficientBalance) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus} disabled insufficientBalance>
          Insufficient {inputToken?.symbol} Balance
        </ModalMigrationButton>
      )
    } else if (awaitingMigrateConfirmation) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Migrating <DotFlashing />
        </ModalMigrationButton>
      )
    }
    return (
      <ModalMigrationButton migrationStatus={migrationStatus} onClick={() => handleMigrate()} disabled={!amountIn}>
        {buttonText + outputToken?.symbol} {awaiting && <DotFlashing />}
      </ModalMigrationButton>
    )
  }

  return (
    <MainModal
      isOpen={isOpen}
      onBackgroundClick={() => toggleReviewModal(false)}
      onEscapeKeydown={() => toggleReviewModal(false)}
    >
      <ModalHeader onClose={() => toggleReviewModal(false)} title={title + outputToken?.symbol} border={false} />

      <Separator />

      <FromWrapper>
        <Row>From</Row>
        <InputBox
          currency={inputToken ?? DEUS_TOKEN}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
        />
      </FromWrapper>

      <Separator />

      <FromWrapper>
        <Row>To</Row>
        <Row>
          {outputToken?.name}
          <span style={{ marginLeft: 'auto' }}>
            <ImageWithFallback
              src={logo}
              width={getImageSize()}
              height={getImageSize()}
              alt={`${outputToken?.name}Logo`}
              round
            />
          </span>
        </Row>
      </FromWrapper>

      {getApproveButton()}
      {getActionButton()}
    </MainModal>
  )
}
