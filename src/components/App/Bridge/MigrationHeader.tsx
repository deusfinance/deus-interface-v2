import { useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'
import { Z_INDEX } from 'theme'

import { ChainInfo } from 'constants/chainInfo'
import { BridgeChains } from 'constants/chains'
import { Card } from 'components/Card'
import { ChevronDown as NavToggleIcon } from 'components/Icons'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import useOnOutsideClick from 'hooks/useOnOutsideClick'

const ConnectedChain = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #8fcca7;
  margin: 0 auto;
  padding-bottom: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px;
    padding-left: 0;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    padding: 5px;
  `};
`
const InlineModal = styled(Card)<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  min-width: 150px;
  transform: translateX(-150px) translateY(20px);
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
  const { chainId } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const ref = useRef(null)

  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <>
      {chainId && BridgeChains.includes(chainId) ? (
        <ConnectedChain>
          {!isMobile && <span>Connected Chain:</span>}
          <ChainWrap onClick={() => toggle()}>
            <InlineRow active>
              <Image
                src={ChainInfo[chainId].logoUrl}
                width={getImageSize() + 'px'}
                height={getImageSize() + 'px'}
                alt={'chain-logo'}
              />
              <ChainDiv>{ChainInfo[chainId].label}</ChainDiv>
            </InlineRow>
            <NavToggle />
          </ChainWrap>
          <div>
            <InlineModal isOpen={isOpen}>
              {BridgeChains.map((chain, index) => {
                return (
                  <div key={index}>
                    <InlineRow active={Number(ChainInfo[chain].chainId) === chainId} onClick={() => toggle()}>
                      <Image
                        src={ChainInfo[chain].logoUrl}
                        width={getImageSize() + 'px'}
                        height={getImageSize() + 'px'}
                        alt={`${ChainInfo[chain].label}-logo`}
                      />
                      <ChainDiv
                        onClick={() => {
                          rpcChangerCallback(Number(ChainInfo[chain].chainId))
                        }}
                      >
                        {ChainInfo[chain].label}
                      </ChainDiv>
                    </InlineRow>
                  </div>
                )
              })}
            </InlineModal>
          </div>
        </ConnectedChain>
      ) : (
        <ConnectedChain style={{ color: 'red' }}>
          <p>Please Connect wallet to continue...</p>
        </ConnectedChain>
      )}
    </>
  )
}
