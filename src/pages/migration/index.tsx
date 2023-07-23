import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import Table from 'components/App/Migrate/Table'
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

export const getImageSize = () => {
  return isMobile ? 15 : 20
}

export default function Migrate() {
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.EASY)

  return (
    <Container>
      <MigrationWrap>
        <HeaderBox />
        <ActionSetter selected={selected} setSelected={setSelected} />

        <Wrapper>
          {selected !== ActionTypes.ALL && <MigrationHeader />}

          {selected === ActionTypes.MANUAL && <Table />}
          {selected === ActionTypes.EASY && <CardBox />}
          {selected === ActionTypes.ALL && <MigratedTable />}
        </Wrapper>
      </MigrationWrap>
    </Container>
  )
}
