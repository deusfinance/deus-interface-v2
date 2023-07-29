import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { BaseButton } from 'components/Button'
import { useRouter } from 'next/router'

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

const MainWrap = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 20px;
  gap: 15px;
  text-align: justify;
  text-justify: inter-word;

  & > * {
    color: #f1f1f1;
    font-size: 14px;
  }
`

const ButtonsWrap = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 20px;
  gap: 10px;
`

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bg3};
`

export const Button = styled(BaseButton)<{ isAccept?: boolean }>`
  height: 40px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-family: Inter;
  background: ${({ theme, isAccept }) => (isAccept ? theme.success : theme.error)};
  color: white;

  &:hover {
    filter: ${({ disabled }) => (disabled ? 'none' : 'brightness(1.2)')};
  }
`

export default function ConfirmationModal({
  isOpen,
  toggleModal,
  handleClick,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  handleClick: () => void
}) {
  const router = useRouter()

  function toggleReviewModal(arg: boolean) {
    toggleModal(arg)
    router.push('/clqdr')
  }

  return (
    <MainModal
      isOpen={isOpen}
      onBackgroundClick={() => toggleReviewModal(false)}
      onEscapeKeydown={() => toggleReviewModal(false)}
    >
      <ModalHeader onClose={() => toggleReviewModal(false)} title={'Important Notice'} border={false} />

      <Separator />

      <MainWrap>
        <p>
          Dear users, please be aware that migrating your DEUS, legacy DEI, bDEI, and xDEUS tokens to either SYMM or
          DEUS involves a waiting period. This process is NOT INSTANT and is IRREVERSIBLE.
        </p>
        <p>BY PROCEEDING, YOU CONFIRM THAT:</p>
        <p>
          You understand the migration process is not instant. You accept that once completed, the migration cannot be
          reversed. The specifics surrounding token distribution will be officially communicated in the third quarter
          (Q3). Anticipate token distributions to occur in the fourth quarter (Q4).
        </p>
        <p>
          Please consider these potential delays prior to depositing your funds. We appreciate your patience and
          understanding. Should you have any questions or concerns, our support team is ready to assist you. Thank you.
        </p>
      </MainWrap>

      <ButtonsWrap>
        <Button onClick={() => toggleReviewModal(false)}>I Reject</Button>

        <Button isAccept onClick={() => toggleModal(false)}>
          I Confirm
        </Button>
      </ButtonsWrap>
    </MainModal>
  )
}
