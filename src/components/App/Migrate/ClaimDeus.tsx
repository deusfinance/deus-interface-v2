import { useCallback, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { toBN } from 'utils/numbers'
import { BaseButton } from 'components/Button'
import { ModalMigrationButton } from './ActionModal'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useWalletModalToggle } from 'state/application/hooks'
import { useGetClaimedDeus } from 'hooks/useMigratePage'
import ClaimConfirmationModal from './ClaimConfirmationModal'

const Wrapper = styled.div`
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column;
    gap: 6px;
  `};
`
const TextWrap = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column;
    width: 100%;
  `};
`
const MainBoxTitle = styled.span`
  font-size: 16px;
`
export const CheckButton = styled(BaseButton)`
  background: linear-gradient(90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
  width: 220px;
  position: relative;
  height: 32px;
  border-radius: 8px;
  &:hover {
    background: linear-gradient(-90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
  }
  &:before {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1d282d;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    z-index: 0;
    border-radius: 8px;
  }
  & > span {
    background: linear-gradient(90deg, #dc756b, #f095a2, #d9a199, #d7c7c1, #d4fdf9);
    display: inline-block;
    width: 100%;
    padding-block: 8px;
    border-radius: 8px;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    z-index: 1;
  }
`
export const DeusText = styled.span`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  background: -webkit-linear-gradient(0deg, #0badf4 -10.26%, #30efe4 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 4px;
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function ClaimDeus({ claimable_deus_amount, proof }: { claimable_deus_amount: any; proof: any }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()
  const [isOpenReviewModal, setOpenReviewModal] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const handleClaimDeus = useCallback(() => {
    setAwaitingConfirmation(true)
    setOpenReviewModal(true)
    setAwaitingConfirmation(false)
  }, [])

  const claimedDeus = toBN(useGetClaimedDeus().toString())

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ModalMigrationButton onClick={toggleWalletModal}>Connect Wallet</ModalMigrationButton>
    } else if (chainId !== SupportedChainId.FANTOM) {
      return (
        <ModalMigrationButton
          style={{ background: ChainInfo[SupportedChainId.FANTOM].color, width: '200px', height: '30px' }}
          onClick={() => rpcChangerCallback(Number(ChainInfo[SupportedChainId.FANTOM].chainId))}
        >
          Switch to {ChainInfo[SupportedChainId.FANTOM].label}
        </ModalMigrationButton>
      )
    } else if (toBN(claimable_deus_amount).minus(claimedDeus).times(1e-18).gt(0)) {
      return (
        <CheckButton
          onClick={
            toBN(claimable_deus_amount).minus(claimedDeus).times(1e-18).gt(0) ? () => handleClaimDeus() : undefined
          }
        >
          <span>CLAIM {toBN(claimable_deus_amount).minus(claimedDeus).times(1e-18).toFixed(3).toString()}</span>
        </CheckButton>
      )
    } else if (toBN(claimable_deus_amount).times(1e-18).eq(0)) {
      return (
        <CheckButton style={{ cursor: 'default' }}>
          <span>Nothing to Claim</span>
        </CheckButton>
      )
    } else if (toBN(claimable_deus_amount).minus(claimedDeus).times(1e-18).eq(0)) {
      return (
        <CheckButton style={{ cursor: 'default' }}>
          <span>Already Claimed</span>
        </CheckButton>
      )
    }
    return (
      <CheckButton style={{ cursor: 'default' }}>
        <span>LOADING</span>
      </CheckButton>
    )
  }

  return (
    <>
      <Wrapper>
        <TextWrap>
          <MainBoxTitle>
            Total Claimable Amount: {toBN(claimable_deus_amount).times(1e-18).toFixed(3).toString()}
            <DeusText>DEUS</DeusText>
          </MainBoxTitle>
          {/* <MainBoxTitle>
            Claimed Amount: {toBN(claimedDeus).times(1e-18).toFixed(3).toString()} <DeusText>DEUS</DeusText>
          </MainBoxTitle> */}
          <MainBoxTitle style={{ fontWeight: 'bold', marginLeft: '25px', marginRight: '25px' }}>
            Left Amount: {toBN(claimable_deus_amount).minus(claimedDeus).times(1e-18).toFixed(3).toString()}{' '}
            <DeusText>DEUS</DeusText>
          </MainBoxTitle>
        </TextWrap>
        <div>{getActionButton()}</div>
      </Wrapper>
      <ClaimConfirmationModal
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => setOpenReviewModal(action)}
        claimable_deus_amount={claimable_deus_amount}
        proof={proof}
      />
    </>
  )
}
