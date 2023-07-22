import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { MigrationOptions } from 'constants/migrationOptions'

import { Row, RowBetween } from 'components/Row'
import Table, { Cell } from 'components/App/Migrate/Table'
import ActionSetter, { ActionTypes } from 'components/App/Migrate/ActionSetter'
import CardBox from 'components/App/Migrate/CardBox'
import HeaderBox from 'components/App/Migrate/HeaderBox'
import MigrationHeader from 'components/App/Migrate/MigrationHeader'
import { MigrationWrap } from 'context/Migration'
import MigratedTable from 'components/App/Migrate/MigratedTable'

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
const LargeContent = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function Migrate() {
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.EASY)
  const [loading, setLoading] = useState(true)

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

  function getAllUpperRow() {
    return (
      <UpperRow>
        <Row style={{ position: 'relative' }}>
          <TableTitle width="20%">Token</TableTitle>
          <TableTitle width="20%">Chain</TableTitle>
          <TableTitle width="25%">My Migrated Amount</TableTitle>
          <TableTitle width="35%">Claimable Token</TableTitle>
        </Row>
      </UpperRow>
    )
  }

  return (
    <Container>
      <MigrationWrap>
        <HeaderBox />

        <ActionSetter selected={selected} setSelected={setSelected} />

        <Wrapper>
          {selected !== ActionTypes.ALL && <MigrationHeader />}

          {selected === ActionTypes.MANUAL && (
            <span>
              <LargeContent>{getUpperRow()}</LargeContent>
              <Table MigrationOptions={MigrationOptions} />
            </span>
          )}

          {selected === ActionTypes.EASY && <CardBox />}

          {selected === ActionTypes.ALL && (
            <span>
              {!loading && <LargeContent>{getAllUpperRow()}</LargeContent>}
              <MigratedTable setLoading={setLoading} />
            </span>
          )}
        </Wrapper>
      </MigrationWrap>
    </Container>
  )
}
