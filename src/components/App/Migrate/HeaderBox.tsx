import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import Image from 'next/image'

import { RowCenter } from 'components/Row'
import { Info } from 'components/Icons'

import SymmLogo from '/public/static/images/tokens/symm.svg'

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
`

const MainTitleSpan = styled.div`
  color: #d4fdf9;
  font-size: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 11px;
  `};
`

const DataBox = styled.div`
  padding-top: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 20px;
  `};
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

export const NoWrapSpan = styled.span`
  white-space: pre;
`

const TitleSpan = styled(NoWrapSpan)`
  color: #b6b6c7;
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 11px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 10px;
  `};
`

const TimeSpan = styled.span`
  color: #b0e2f1;
  font-size: 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 13px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 12px;
  `};
`

const Item = styled.div`
  display: inline-block;
  height: 100%;
  margin-right: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: row wrap;
    margin-right: 0;
    margin-bottom: 12px;
  `};
`

const Name = styled.div<{ underline?: boolean }>`
  color: #bea29c;
  font-size: 12px;
  font-family: Inter;
  text-decoration-line: ${({ underline }) => (underline ? `underline` : 'none')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
`

const ValueBox = styled.div`
  margin-top: 10px;
  color: #d5f1ed;
  font-size: 20px;
  font-family: Inter;
  gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-top: 0;
    margin-left: auto;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    padding-left: 2px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSuperTiny`
    font-size: 9px;
  `};
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function HeaderBox() {
  const TopWrapItems = useMemo(
    () => [
      { name: 'Early Migrator Bonus:', value: '73%', underline: true, logo: true, infoLogo: true },
      { name: 'Total Migrated:', value: '221,284.273', extension: 'DEUS', deusColor: true },
      { name: 'SYMM per DEUS ratio:', value: '2999', extension: 'SYMM per DEUS', deusColor: false },
    ],
    []
  )

  return (
    <TopWrap>
      <MainTitleSpan>Deposit your DEUS ecosystem tokens to migrate.</MainTitleSpan>
      <DataBox>
        {TopWrapItems &&
          TopWrapItems.map((item, index) => (
            <Item key={index}>
              <Name underline={item.underline}>
                {item.name}
                {item.infoLogo && <Info size={11} style={{ marginLeft: '3px', marginBottom: '-1px' }} />}
              </Name>
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
          <TitleSpan>Early Migration Ends in: </TitleSpan>
          <TimeSpan>2d : 14h : 52m : 04s</TimeSpan>
        </RowCenter>
      </StickyTopWrap>
    </TopWrap>
  )
}
