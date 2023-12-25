import { ChangeEvent, useCallback, useState } from 'react'
import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { DotFlashing } from 'components/Icons'
import { MigrationButton } from './MigrationCard'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { useTransferCallback } from 'hooks/useMigrateCallback'
import { CheckButton, IMigrationInfo, ModalType, SmallChainWrap, TableInputWrapper } from './MigratedTable'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ChainInfo } from 'constants/chainInfo'
import { Token } from '@sushiswap/core-sdk'
import { Row } from 'components/Row'
import { isAddress, truncateAddress } from 'utils/address'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import ImageWithFallback from 'components/ImageWithFallback'
import Image from 'next/image'
import { Plus } from 'react-feather'
import BigNumber from 'bignumber.js'
import { DeusText } from '../Stake/RewardBox'
import { SymmText } from './HeaderBox'
import { formatBalance, formatNumber } from 'utils/numbers'
import { InputField } from 'components/Input'
import toast from 'react-hot-toast'
import RightArrow from 'components/Icons/RightArrow'

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
export const ModalMigrationButton = styled(MigrationButton)`
  width: 93%;
  margin: 15px auto;
`
const Card = styled.div`
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 20px;
  padding: 16px;
  width: 65%;
  border: 1px solid #2c2c2c;
`
const Card2 = styled(Card)`
  width: 35%;
  min-height: 75px;
  justify-content: center;
`
const TokenContainer = styled(Row)`
  margin-bottom: 12px;
`
const ImageWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border1};
  margin-right: 8px;
  border-radius: 100%;
`
const PlusIcon = styled(Plus)`
  width: 14px;
  fill: #959595;
`

function getImageSize() {
  return isMobile ? 20 : 30
}

export default function TransferModal({
  isOpen,
  toggleModal,
  migrationInfo,
  token,
  modalType,
  isEarly,
  migratedToDEUS,
  migratedToSYMM,
  calculatedSymmPerDeus,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  migrationInfo: IMigrationInfo
  token: Token
  modalType: ModalType
  isEarly: boolean
  migratedToDEUS: BigNumber
  migratedToSYMM: BigNumber
  calculatedSymmPerDeus: BigNumber
}) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const tokenChain = token?.chainId
  const logo = useCurrencyLogo(token.address)
  const migrationAmount = (migrationInfo?.amount * 1e-18).toString()

  const [amountIn, setAmountIn] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const {
    state: TransferMigrateCallbackState,
    callback: TransferMigrateCallback,
    error: TransferMigrateCallbackError,
  } = useTransferCallback(migrationInfo?.indexInChain, amountIn)

  const handleTransferMigrate = useCallback(async () => {
    console.log('called handleTransferMigrate')
    console.log(TransferMigrateCallbackState, TransferMigrateCallbackError)
    if (!TransferMigrateCallback) return
    try {
      setAwaitingConfirmation(true)
      const txHash = await TransferMigrateCallback()
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
  }, [TransferMigrateCallback, TransferMigrateCallbackError, TransferMigrateCallbackState, toggleModal])

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
    } else if (awaitingConfirmation) {
      return (
        <ModalMigrationButton migrationStatus="full_symm">
          Transferring <DotFlashing />
        </ModalMigrationButton>
      )
    }
    return (
      <ModalMigrationButton
        disabled={!isAddress(amountIn)}
        migrationStatus="full_symm"
        onClick={() => handleTransferMigrate()}
      >
        Transfer to {isAddress(amountIn) ? truncateAddress(amountIn) : '...'}
      </ModalMigrationButton>
    )
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmountIn(e.target.value)
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (isAddress(text)) setAmountIn(text)
      else toast.error('Paste a valid address')
    } catch (error) {
      console.error('Error pasting text: ', error)
    }
  }

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={modalType} border={false} />

      <Separator />
      <FromWrapper>
        <Row>Migration Details</Row>
        <Row style={{ width: '100%', gap: '12px' }}>
          <Card>
            <TokenContainer>
              <ImageWrapper>
                <ImageWithFallback
                  src={logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`${token.symbol} Logo`}
                  round
                />
              </ImageWrapper>

              <span>{migrationAmount + ' ' + token.name}</span>
            </TokenContainer>

            <SmallChainWrap style={{ gap: '4px' }}>
              <span>{isEarly ? 'Early' : 'Late'} Migration on </span>
              <span style={{ color: ChainInfo[tokenChain].color }}>{ChainInfo[tokenChain].label}</span>
              <Image
                src={ChainInfo[tokenChain].logoUrl}
                width={getImageSize() / 2.3 + 'px'}
                height={getImageSize() / 2.3 + 'px'}
                alt={`${ChainInfo[tokenChain].label}-logo`}
              />
            </SmallChainWrap>
          </Card>

          <RightArrow />

          <Card2>
            {migratedToDEUS.toString() !== '0' && (
              <span>
                {formatNumber(formatBalance(migratedToDEUS.toString(), 3))} <DeusText>DEUS</DeusText>
              </span>
            )}
            {migratedToDEUS.toString() !== '0' && migratedToSYMM.toString() !== '0' && <PlusIcon />}
            {migratedToSYMM.toString() !== '0' && (
              <span>
                {formatNumber(formatBalance(calculatedSymmPerDeus.toString(), 3))} <SymmText>SYMM</SymmText>
              </span>
            )}
          </Card2>
        </Row>
      </FromWrapper>

      <Separator />
      <FromWrapper>
        <Row>To</Row>
        <TableInputWrapper style={{ width: '100%', margin: '0', background: '#222' }}>
          <InputField
            autoFocus
            type="text"
            spellCheck="false"
            placeholder="Wallet address"
            value={amountIn}
            onChange={handleInputChange}
          />
          <CheckButton onClick={pasteFromClipboard}>
            <span>Paste</span>
          </CheckButton>
        </TableInputWrapper>
      </FromWrapper>

      {getActionButton()}
    </MainModal>
  )
}
