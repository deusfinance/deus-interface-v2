import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import { BaseButton } from 'components/Button'
import { useCallback, useState } from 'react'
import { claimTermOfServiceSignatureMessage } from 'constants/misc'
import { useClaimDeusCallback, useSignMessage } from 'hooks/useMigrateCallback'
import useWeb3React from 'hooks/useWeb3'
import { ExternalLink } from 'components/Link'
import toast from 'react-hot-toast'
import { toBN } from 'utils/numbers'

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

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    & > * {
      font-size: 11px;
    }
  `};
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

export const Button = styled(BaseButton)<{ isAccept?: boolean; disable?: boolean }>`
  height: 40px;
  border-radius: 8px;
  text-align: center;
  font-family: Inter;
  background: ${({ theme, isAccept, disable }) => (disable ? theme.gray : isAccept ? theme.success : theme.error)};
  cursor: ${({ disable }) => (disable ? 'default' : 'pointer')};
  color: white;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `};

  &:hover {
    filter: ${({ disable }) => (disable ? 'none' : 'brightness(1.2)')};
  }
`

export default function ClaimConfirmationModal({
  isOpen,
  toggleModal,
  claimable_deus_amount,
  proof,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  claimable_deus_amount: any
  proof: any
}) {
  const { account } = useWeb3React()
  const [signature, setSignature] = useState<string | undefined>(undefined)
  const [isFirstCheckboxChecked, setIsFirstCheckboxChecked] = useState(false)
  // const [isSecondCheckboxChecked, setIsSecondCheckboxChecked] = useState(false)

  const {
    state: signCallbackState,
    callback: signCallback,
    error: signCallbackError,
  } = useSignMessage(claimTermOfServiceSignatureMessage)

  const handleSign = useCallback(async () => {
    console.log('called handleSign')
    console.log(signCallbackState, signCallbackError)
    if (!signCallback) return
    try {
      return await signCallback()
    } catch (e) {
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [signCallbackState, signCallbackError, signCallback])

  const {
    state: claimDeusCallbackState,
    callback: claimDeusCallback,
    error: claimDeusCallbackError,
  } = useClaimDeusCallback(claimable_deus_amount, proof)

  const handleClaimDeus = useCallback(async () => {
    console.log('called handleClaimDeus')
    console.log(claimDeusCallbackState, claimDeusCallbackError)
    if (!claimDeusCallback) return
    try {
      // setAwaitingConfirmation(true)
      // toggleReviewModal(true)
      const txHash = await claimDeusCallback()
      // setAwaitingConfirmation(false)
      toggleModal(false)
      console.log({ txHash })
    } catch (e) {
      // setAwaitingConfirmation(false)
      toggleModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [claimDeusCallback, claimDeusCallbackError, claimDeusCallbackState, toggleModal])

  // const handleCheck = useCallback(async () => {
  //   handleSign().then((response) => {
  //     if (response) {
  //       setSignature(response)
  //       handleClaimDeus()
  //       toggleModal(false)
  //     }
  //   })
  // }, [handleClaimDeus, handleSign, toggleModal])

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={'Recovery Confirmation'} border={false} />

      <Separator />

      <MainWrap>
        <p>
          By signing this page, you agree to the terms and conditions outlined in this document. Here is a{' '}
          <ExternalLink
            href={'https://docs.deus.finance/contracts/reimbursement-guide'}
            style={{ textDecoration: 'underline' }}
          >
            guide
          </ExternalLink>{' '}
          to help you.
        </p>

        <p>
          TL:DR with this & earlier claims you received your full reimbursement and you don&apos;t hold any future
          claims, there won&apos;t be any further / future claim available.
        </p>

        <p>
          - You receive {toBN(claimable_deus_amount).times(1e-18).toFixed(3).toString()} DEUS directly after claiming,
          now in {account}
        </p>

        <p>- You need to sign two transactions with your wallet.</p>

        <p>- You understand that you will be digitally signing the document using your Ethereum wallet</p>

        <div>
          <input
            type="checkbox"
            id="firstCheckbox"
            checked={isFirstCheckboxChecked}
            onChange={(e) => setIsFirstCheckboxChecked(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="firstCheckbox" style={{ paddingTop: '5px' }}>
            <span>
              {' '}
              I went through the{' '}
              <ExternalLink
                href={'https://docs.deus.finance/contracts/reimbursement-guide'}
                style={{ textDecoration: 'underline' }}
              >
                guide
              </ExternalLink>{' '}
              and{' '}
              <ExternalLink
                href={
                  'https://docs.deus.finance/contracts/reimbursement-guide/reimbursement-process/waiver-and-release-letter'
                }
                style={{ textDecoration: 'underline' }}
              >
                waiver document
              </ExternalLink>
            </span>
          </label>
        </div>

        {/* <div>
          <input
            type="checkbox"
            id="secondCheckbox"
            checked={isSecondCheckboxChecked}
            onChange={(e) => setIsSecondCheckboxChecked(e.target.checked)}
          />
          <label htmlFor="secondCheckbox">
            <span> I want to receive funds on a different address</span>
          </label>
        </div> */}
      </MainWrap>

      <ButtonsWrap>
        {/* <Button onClick={() => toggleModal(false)}>Reject</Button> */}

        {!isFirstCheckboxChecked ? (
          <Button disable isAccept onClick={() => toast.error('Check the Box')}>
            Sign & Confirm
          </Button>
        ) : (
          <Button isAccept onClick={() => handleClaimDeus()}>
            Sign & Confirm
          </Button>
        )}
      </ButtonsWrap>
    </MainModal>
  )
}
