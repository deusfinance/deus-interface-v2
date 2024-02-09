import { useCallback, useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { Row } from 'components/Row'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { ModalType } from './MigratedTable'
import { useClaimDeusCallback } from 'hooks/useMigrateCallback'
import { INFO_URL } from 'constants/misc'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'
import { BaseButton } from 'components/Button'
import { ModalMigrationButton } from './ActionModal'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useWalletModalToggle } from 'state/application/hooks'
// import ClaimModal from './ClaimModal'
// import { XDEUS_TOKEN } from 'constants/tokens'

const MainBoxTitle = styled.span`
  padding: 20px;
  font-size: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-left: 12px;
    padding-top: 10px;
    padding-right: 0;
    font-size: 13px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    padding-left: 6px;
    font-size: 10px;
  `};
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

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function ClaimDeus() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const ref = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [claimable_deus_amount, setClaimable_deus_amount] = useState<any>(undefined)
  const [proof, setProof] = useState<any>(undefined)
  const [error, setError] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  const [modalType, setModalType] = useState<ModalType>(ModalType.WITHDRAW)
  const [isOpenModal, toggleModal] = useState(false)

  function toggleReviewModal(arg: boolean, type: ModalType) {
    setModalType(type)
    toggleModal(arg)
  }

  const findUserData = useCallback(async () => {
    if (!account) return null
    try {
      const { href: url } = new URL(`/symm/proofs/fantomClaimDeus/${account}/`, INFO_URL)
      const res = makeHttpRequest(url)
      return res
    } catch (error) {
      return null
    }
  }, [account])

  const handleCheck = useCallback(async () => {
    const userData = await findUserData()
    if (userData?.status === 'error') {
      setError(true)
    } else {
      setError(false)
      setClaimable_deus_amount(userData['claimable_deus_amount'])
      setProof(userData['proof'])
    }
  }, [findUserData])

  useEffect(() => {
    if (account) handleCheck()
  }, [account, handleCheck])

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
      setAwaitingConfirmation(true)
      const txHash = await claimDeusCallback()
      setAwaitingConfirmation(false)
      // toggleModal(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingConfirmation(false)
      // toggleModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [claimDeusCallback, claimDeusCallbackError, claimDeusCallbackState])

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
    }
    return (
      <CheckButton onClick={Number(claimable_deus_amount) > 0 ? () => handleClaimDeus() : undefined}>
        <span>CLAIM {toBN(claimable_deus_amount).times(1e-18).toFixed(3).toString()}</span>
      </CheckButton>
    )
  }

  return (
    <Row ref={ref}>
      <MainBoxTitle>Claim DEUS:</MainBoxTitle>
      <div style={{ display: 'flex' }}>{getActionButton()}</div>
    </Row>
  )
}
