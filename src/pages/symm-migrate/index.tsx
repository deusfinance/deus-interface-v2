import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { MigrationOptions } from 'constants/migrationOptions'

import { Row, RowBetween } from 'components/Row'
import Table, { Cell } from 'components/App/Migration/Table'
import ActionSetter, { ActionTypes } from 'components/App/Migration/ActionSetter'
import CardBox from 'components/App/Migration/CardBox'
import HeaderBox from 'components/App/Migration/HeaderBox'
import MigrationHeader from 'components/App/Migration/MigrationHeader'

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
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.EASY)

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

  return (
    <Container>
      <HeaderBox />

      <ActionSetter selected={selected} setSelected={setSelected} />

      <Wrapper>
        <MigrationHeader />

        {selected === ActionTypes.MANUAL ? (
          <span>
            {getUpperRow()}
            <Table MigrationOptions={MigrationOptions} />
          </span>
        ) : (
          <CardBox />
        )}
      </Wrapper>
    </Container>
  )
}
