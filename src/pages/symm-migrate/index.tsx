import React, { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { MigrationOptions } from 'constants/migrationOptions'

import { Row, RowBetween } from 'components/Row'
import Table, { Cell } from 'components/App/Migration/Table'
import Image from 'next/image'
import { RowCenter } from 'components/Row'

import SymmLogo from '/public/static/images/pages/migration/symm.svg'
import ActionSetter, { ActionTypes } from 'components/App/Migration/ActionSetter'
import { Card } from 'components/Card'
import { Z_INDEX } from 'theme'
import { ChevronDown as NavToggleIcon } from 'components/Icons'
import useOnOutsideClick from 'hooks/useOnOutsideClick'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { SupportedChainId } from 'constants/chains'
import useWeb3React from 'hooks/useWeb3'

import ARBITRUM_LOGO from '/public/static/images/networks/arbitrum.svg'
import FANTOM_LOGO from '/public/static/images/networks/fantom.svg'
import { ChainInfo } from 'constants/chainInfo'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  font-family: Inter;
`

const Wrapper = styled(Container)`
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
  margin: 0 auto;
  width: clamp(250px, 90%, 1168px);
  margin-top: 30px;

  & > * {
    &:nth-child(4) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg1};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  & > * {
    margin: 8px 8px;
  }
`

const TopWrap = styled.div`
  font-family: 'Inter';
  position: relative;
  width: clamp(250px, 90%, 1168px);
  margin: 20px auto;
  min-height: 180px;
  background: ${({ theme }) => theme.bg0};
  padding: 20px;
  padding-top: 25px;
  border-radius: 15px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 100px;
    font-size: 40px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 30px;
  `}
`

const MainTitleSpan = styled.div`
  color: #d4fdf9;
  font-size: 16px;
`

const DataBox = styled.div`
  padding-top: 30px;
`

const StickyTopWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 0px 0px 12px 12px;
  background: rgba(29, 40, 45, 0.3);
  height: 35px;
`

const NoWrapSpan = styled.span`
  white-space: pre;
`

const TitleSpan = styled(NoWrapSpan)`
  color: #b6b6c7;
  font-size: 12px;
`

const TimeSpan = styled.span`
  color: #b0e2f1;
  font-size: 14px;
`

const Item = styled.div`
  display: inline-block;
  height: 100%;
  margin-right: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 15px;
  `};
`

const Name = styled.div<{ underline?: boolean }>`
  color: #bea29c;
  font-size: 12px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: ${({ underline }) => (underline ? `underline` : 'none')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `};
`

const ValueBox = styled.div`
  margin-top: 10px;
  color: #d5f1ed;
  font-size: 20px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  gap: 10px;
`

const ExtensionSpan = styled.span<{ deusColor?: boolean }>`
  font-size: 13px;
  padding-left: 4px;
  color: ${({ theme }) => theme.symmColor};
  ${({ deusColor }) =>
    deusColor &&
    ` 
    background: -webkit-linear-gradient(0deg, #0badf4 -10.26%, #30efe4 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `};
`

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

const TableTitle = styled(Cell)`
  height: fit-content;
  color: #7f8082;
  font-size: 12px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: start;
  padding-left: 12px;
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function Migrate() {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const ref = useRef(null)
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.EASY)
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  function getUpperRow() {
    return (
      <UpperRow>
        <Row style={{ position: 'relative' }}>
          <TableTitle width="25%">Token</TableTitle>
          <TableTitle width="20%">My Balance</TableTitle>
          <TableTitle width="25%">My Migrated Amount</TableTitle>
        </Row>
      </UpperRow>
    )
  }

  const TopWrapItems = useMemo(
    () => [
      { name: 'Early Migrator Bonus (i):', value: '73%', underline: true, logo: true },
      { name: 'Total Migrated:', value: '221,284.273', extension: 'DEUS', deusColor: true },
      { name: 'SYMM per DEUS ratio:', value: '2999', extension: 'SYMM per DEUS', deusColor: false },
    ],
    []
  )

  return (
    <Container ref={ref}>
      <TopWrap>
        <MainTitleSpan>Deposit your DEUS ecosystem tokens to migrate.</MainTitleSpan>
        <DataBox>
          {TopWrapItems &&
            TopWrapItems.map((item, index) => (
              <Item key={index}>
                <Name underline={item.underline}>{item.name}</Name>
                <ValueBox>
                  {item.value}
                  {item.extension && <ExtensionSpan deusColor={item.deusColor}>{item.extension}</ExtensionSpan>}
                  {item.logo && (
                    <span style={{ paddingLeft: '4px' }}>
                      <Image alt="SymmLogo" width={getImageSize()} height={14} src={SymmLogo} />
                    </span>
                  )}
                </ValueBox>
              </Item>
            ))}
        </DataBox>
        <StickyTopWrap>
          <RowCenter>
            <TitleSpan>Migration Ends in: </TitleSpan>
            <TimeSpan>2d : 14h : 52m : 04s</TimeSpan>
          </RowCenter>
        </StickyTopWrap>
      </TopWrap>

      <ActionSetter selected={selected} setSelected={setSelected} />

      <Wrapper>
        <Row>
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

        {selected === ActionTypes.MANUAL ? (
          <span>
            {getUpperRow()}
            <Table isMobile={isMobile} MigrationOptions={MigrationOptions} />
          </span>
        ) : (
          <span>easy mode</span>
        )}
      </Wrapper>
    </Container>
  )
}
