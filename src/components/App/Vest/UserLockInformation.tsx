import React from 'react'
import styled from 'styled-components'
import QuestionMark from 'components/Icons/QuestionMark'
import { RowStart } from 'components/Row'
import { ToolTip } from 'components/ToolTip'

const Wrapper = styled.div`
  font-family: 'Inter';
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin-top: 20px;
  gap: 10px;
`

const Row = styled.div<{ active?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    &:last-child {
      color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
    }
    color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  }
`

const Title = styled.div`
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border1};
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-weight: bold;
  color: ${({ theme }) => theme.text2};
`

const CustomTooltip = styled(ToolTip)`
  background: ${({ theme }) => theme.bg2} !important;
  color: ${({ theme }) => theme.clqdrBlueColor} !important;
  max-width: 380px !important;
`
export const QuestionMarkWrap = styled.div`
  margin-left: 4px;
  margin-right: 2px;
  margin-top: 2px;
  background: transparent;
  cursor: pointer;
  max-width: 380px !important;

  * {
    fill: ${({ theme }) => theme.clqdrBlueColor};
  }
`

export default function UserLockInformation({
  title,
  vestAmount,
  migrationAmount,
  nftList,
}: {
  vestAmount: string
  migrationAmount: string
  nftList: number[]
  title?: string
}) {
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Row active={true}>
        <RowStart width={'unset'}>
          <div>Selected NFTs</div>
          <CustomTooltip id="id" />
          <QuestionMarkWrap
            data-for="id"
            data-tip={`selected veDEUS for migration: ${nftList.length ? '#' : '> Nothing! <'}${nftList.join(' ,#')}`}
          >
            <QuestionMark width={15} height={15} />
          </QuestionMarkWrap>
          <div>:</div>
        </RowStart>
        <div>{nftList.length} veDEUS NFT(s)</div>
      </Row>
      <Row active={true}>
        <div>Total Vest Amount:</div>
        <div>{vestAmount} DEUS</div>
      </Row>
      <Row active={true}>
        <div>Total Migration Amount:</div>
        <div>{migrationAmount} vDEUS</div>
      </Row>
    </Wrapper>
  )
}
