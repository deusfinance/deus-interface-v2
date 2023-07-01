import { useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'
import { Z_INDEX } from 'theme'

import { Row } from 'components/Row'

import ARBITRUM_LOGO from '/public/static/images/networks/arbitrum.svg'
import FANTOM_LOGO from '/public/static/images/networks/fantom.svg'

import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'

import { Card } from 'components/Card'
import { ChevronDown as NavToggleIcon } from 'components/Icons'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import useOnOutsideClick from 'hooks/useOnOutsideClick'

const MainBoxTitle = styled.span`
  padding: 20px;
  font-size: 16px;
`

const ConnectedChain = styled.span`
  display: flex;
  align-items: center;
  padding: 20px;
  font-size: 14px;
  margin-left: auto;
  color: #8fcca7;
`

const InlineModal = styled(Card)<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 190px;
  transform: translateX(-190px) translateY(20px);
  z-index: ${Z_INDEX.modal};
  gap: 12px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border3};
  border-radius: 10px;
`

const NavToggle = styled(NavToggleIcon)`
  &:hover,
  &:focus {
    filter: brightness(1.5);
    cursor: pointer;
  }
`

const InlineRow = styled.div<{ active?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active, theme }) =>
    active &&
    ` color: ${theme.clqdrBlueColor};
      pointer-events: none;
  `};
`

const ChainDiv = styled.div`
  margin-right: auto;
  margin-left: 6px;
  margin-top: 2px;
`

const ChainWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #181a1f;
  border-radius: 8px;
  padding: 8px;
  gap: 30px;
  margin-left: 8px;

  &:hover,
  &:focus {
    cursor: pointer;
  }
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function MigrationHeader() {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const ref = useRef(null)

  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <Row ref={ref}>
      <MainBoxTitle>Tokens Available to Migrate</MainBoxTitle>
      <ConnectedChain>
        {/* TODO: This part does not support all chains */}
        <span>Connected Chain:</span>
        <ChainWrap onClick={() => toggle()}>
          <InlineRow active>
            <Image
              src={chainId === SupportedChainId.FANTOM ? FANTOM_LOGO : ARBITRUM_LOGO}
              width={getImageSize() + 'px'}
              height={getImageSize() + 'px'}
              alt={'chain-logo'}
            />
            <ChainDiv>{ChainInfo[chainId ?? SupportedChainId.FANTOM].chainName}</ChainDiv>
          </InlineRow>
          <NavToggle />
        </ChainWrap>
        <div>
          <InlineModal isOpen={isOpen}>
            <div>
              <InlineRow active={SupportedChainId.ARBITRUM === chainId} onClick={() => toggle()}>
                <Image
                  src={ARBITRUM_LOGO}
                  width={getImageSize() + 'px'}
                  height={getImageSize() + 'px'}
                  alt={'chain-logo'}
                />
                <ChainDiv onClick={() => rpcChangerCallback(SupportedChainId.ARBITRUM)}>
                  {ChainInfo[SupportedChainId.ARBITRUM].chainName}
                </ChainDiv>
              </InlineRow>
            </div>
            <div>
              <InlineRow active={SupportedChainId.FANTOM === chainId} onClick={() => toggle()}>
                <Image
                  src={FANTOM_LOGO}
                  width={getImageSize() + 'px'}
                  height={getImageSize() + 'px'}
                  alt={'chain-logo'}
                />
                <ChainDiv onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>
                  {ChainInfo[SupportedChainId.FANTOM].chainName}
                </ChainDiv>
              </InlineRow>
            </div>
          </InlineModal>
        </div>
      </ConnectedChain>
    </Row>
  )
}