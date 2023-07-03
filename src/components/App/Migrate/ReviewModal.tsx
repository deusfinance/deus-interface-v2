import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { Row, RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { TokenBalancesMap } from 'state/wallet/types'
import { formatUnits } from '@ethersproject/units'
import ImageWithFallback from 'components/ImageWithFallback'
import { isMobile } from 'react-device-detect'
import { MigrationButton } from './MigrationCard'

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

export default function ReviewModal({
  title,
  inputTokens,
  outputTokens,
  amountsIn,
  amountsOut,
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
  amountsOut: TokenBalancesMap
  inputTokenLogos: string[]
  outputTokenLogos: string[]
  isOpen: boolean
  migrationStatus: string
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting: boolean
}) {
  // const token = inputTokens[0]
  // console.log({ amountsIn })
  // console.log(formatUnits(amountsIn[token?.address].quotient.toString(), token?.decimals))

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title} border={false} />

      <Separator />

      <FromWrapper>
        <Row>From</Row>
        {inputTokens &&
          inputTokens.map((token, index) => (
            <Row key={index}>
              {amountsIn.length && formatUnits(amountsIn[token?.address].quotient.toString(), token?.decimals)}{' '}
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
              {amountsOut.length && formatUnits(amountsOut[token?.address].quotient.toString(), token?.decimals)}{' '}
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

      <MigrationButton
        style={{ width: '93%', margin: '15px auto' }}
        migrationStatus={migrationStatus}
        onClick={() => handleClick()}
      >
        {buttonText} {awaiting && <DotFlashing style={{ marginLeft: '10px' }} />}
      </MigrationButton>
    </MainModal>
  )
}
