import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'

import { ModalHeader, Modal } from 'components/Modal'
import { Row } from 'components/Row'
import { DotFlashing } from 'components/Icons'
import { TokenBalancesMap } from 'state/wallet/types'
import ImageWithFallback from 'components/ImageWithFallback'
import { useMigratorContract } from 'hooks/useContract'
import { ApprovalState, useApproveCallbacksWithAmounts } from 'hooks/useApproveCallbacks'
import useMigrateCallback from 'hooks/useMigrateCallback'
import { ModalMigrationButton } from './ManualReviewModal'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { formatBalance, toBN } from 'utils/numbers'

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

function getImageSize() {
  return isMobile ? 15 : 20
}

export default function ReviewModal({
  title,
  inputTokens,
  outputTokens,
  amountsIn,
  // amountsOut,
  inputTokenLogos,
  outputTokenLogos,
  isOpen,
  migrationStatus,
  buttonText,
  toggleModal,
  handleClick,
  awaiting,
}: {
  title: string
  inputTokens: Token[]
  outputTokens: Token[]
  amountsIn: TokenBalancesMap
  // amountsOut: TokenBalancesMap
  inputTokenLogos: string[]
  outputTokenLogos: string[]
  isOpen: boolean
  migrationStatus: string
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting: boolean
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState(false)

  const MigratorContract = useMigratorContract()
  const spender = useMemo(() => MigratorContract?.address, [MigratorContract])

  const amountsToApprove = useMemo(() => {
    return inputTokens.map((token) => {
      const amount = toBN(amountsIn[token?.address]?.quotient.toString()).div(1e18).toString()
      if (!amount || isNaN(Number(amount))) return '0'
      return amount
    })
  }, [amountsIn, inputTokens])

  const [approvalStates, handleApproveByIndex] = useApproveCallbacksWithAmounts(
    inputTokens ?? undefined,
    spender,
    amountsToApprove,
    true
  )
  const [showApprove, showApproveLoader, tokenIndex] = useMemo(() => {
    for (let index = 0; index < approvalStates.length; index++) {
      const approvalState = approvalStates[index]
      const amountIn = amountsIn[inputTokens[index]?.address]
      if (
        approvalState !== ApprovalState.APPROVED &&
        amountIn &&
        amountIn?.toSignificant(amountIn.currency.decimals) !== '0'
      )
        return [true, approvalState === ApprovalState.PENDING, index]
    }
    return [false, false, -1]
  }, [approvalStates, amountsIn, inputTokens])

  const handleApprove = async (index: number) => {
    setAwaitingApproveConfirmation(true)
    await handleApproveByIndex(index)
    setAwaitingApproveConfirmation(false)
  }

  const inputAmounts = useMemo(() => {
    return inputTokens.map((token) => {
      return amountsIn[token?.address]
    })
  }, [amountsIn, inputTokens])

  const zeroAmounts = useMemo(() => {
    for (let index = 0; index < inputTokens.length; index++) {
      const token = inputTokens[index]
      if (amountsIn[token?.address]?.quotient.toString() !== '0') return false
    }
    return true
  }, [amountsIn, inputTokens])

  const {
    state: migrateCallbackState,
    callback: migrateCallback,
    error: migrateCallbackError,
  } = useMigrateCallback(inputTokens, inputAmounts, outputTokens)

  const handleMigrate = useCallback(async () => {
    console.log('called handleMigrate')
    console.log(migrateCallbackState, migrateCallbackError)
    if (!migrateCallback) return
    try {
      setAwaitingMigrateConfirmation(true)
      const txHash = await migrateCallback()
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
  }, [migrateCallbackState, migrateCallbackError, migrateCallback, toggleModal])

  function getApproveButton(): JSX.Element | null {
    if (!chainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Awaiting Confirmation <DotFlashing />
        </ModalMigrationButton>
      )
    }
    if (showApproveLoader) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Approving <DotFlashing />
        </ModalMigrationButton>
      )
    }
    if (showApprove) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus} onClick={() => handleApprove(tokenIndex)}>
          Allow us to spend {inputTokens[tokenIndex]?.symbol}
        </ModalMigrationButton>
      )
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account)
      return (
        <ModalMigrationButton migrationStatus={migrationStatus} onClick={toggleWalletModal}>
          Connect Wallet
        </ModalMigrationButton>
      )
    if (showApprove) return null

    if (awaitingMigrateConfirmation) {
      return (
        <ModalMigrationButton migrationStatus={migrationStatus}>
          Migrating
          <DotFlashing />
        </ModalMigrationButton>
      )
    }
    if (zeroAmounts) {
      return (
        <ModalMigrationButton disabled={zeroAmounts} migrationStatus={migrationStatus}>
          {buttonText}
        </ModalMigrationButton>
      )
    }
    return (
      <ModalMigrationButton migrationStatus={migrationStatus} onClick={() => handleMigrate()}>
        {buttonText} {awaiting && <DotFlashing />}
      </ModalMigrationButton>
    )
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title} border={false} />

      <Separator />

      <FromWrapper>
        <Row>From</Row>
        {inputTokens &&
          inputTokens.map((token, index) => (
            <Row key={index}>
              {formatBalance(formatUnits(amountsIn[token?.address]?.quotient.toString() ?? '0', token?.decimals))}{' '}
              {token?.name}
              <span style={{ marginLeft: 'auto' }}>
                <ImageWithFallback
                  src={inputTokenLogos[index]}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`${token?.name}Logo`}
                  key={index}
                  round
                />
              </span>
            </Row>
          ))}
      </FromWrapper>

      <Separator />

      <FromWrapper>
        <Row>To</Row>
        {outputTokens &&
          outputTokens.map((token, index) => (
            <Row key={index}>
              {/* {formatUnits(amountsOut[token?.address]?.quotient.toString() ?? '0', token?.decimals)} */}
              {token?.name}
              <span style={{ marginLeft: 'auto' }}>
                <ImageWithFallback
                  src={outputTokenLogos[index]}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`${token?.name}Logo`}
                  key={index}
                  round
                />
              </span>
            </Row>
          ))}
      </FromWrapper>

      {getApproveButton()}
      {getActionButton()}
    </MainModal>
  )
}
