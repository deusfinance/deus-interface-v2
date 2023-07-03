import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { Row, RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { isMobile } from 'react-device-detect'
import { MigrationButton } from './MigrationCard'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import InputBox from '../Swap/InputBox'
import { useState } from 'react'

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
    height: 560px;
  `};
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;

  gap: 0.8rem;
  padding: 1.5rem 0;
  overflow-y: scroll;
  height: auto;
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

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding-top: 1rem;
`

const Data = styled(RowCenter)`
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 300;
  font-size: 12px;
  line-height: 14px;
  width: 100%;
  margin-left: 10px;
  padding: 5px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`
const ConfirmButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.text4};
  height: 62px;
  max-width: 90%;
  margin: 20px auto;
`

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bg3};
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
  handleClick,
  awaiting,
}: {
  title: string
  isOpen: boolean
  inputToken: Token
  outputToken: Token
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting: boolean
}) {
  const logo = useCurrencyLogo(outputToken?.address)
  const [amountIn, setAmountIn] = useState('')

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title + outputToken?.symbol} border={false} />

      <Separator />

      <FromWrapper>
        <Row>From</Row>
        {/* TODO: recode a new InputBox (new design, refactor code, etc) */}
        <InputBox
          currency={inputToken}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          disable_vdeus
        />
      </FromWrapper>

      <Separator />

      <FromWrapper>
        <Row>To</Row>
        <Row>
          {'0.00'} {outputToken?.name}
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

      <MigrationButton
        style={{ width: '93%', margin: '15px auto' }}
        migrationStatus={outputToken?.symbol === 'DEUS' ? 'full_deus' : 'full_symm'}
        onClick={() => handleClick()}
        disabled={!amountIn}
      >
        {buttonText + outputToken?.symbol} {awaiting && <DotFlashing style={{ marginLeft: '10px' }} />}
      </MigrationButton>
    </MainModal>
  )
}
