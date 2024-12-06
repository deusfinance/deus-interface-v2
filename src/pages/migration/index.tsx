import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import ActionSetter, { ActionTypes } from 'components/App/Migrate/ActionSetter'
import HeaderBox from 'components/App/Migrate/HeaderBox'
import { MigrationWrap } from 'context/Migration'
import MigratedTable from 'components/App/Migrate/MigratedTable'
import ClaimWrap from 'components/App/Migrate/ClaimWrap'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  font-family: Inter;
`

const Wrapper = styled(Container)`
  background: ${({ theme }) => theme.bg2};
  margin: 0 auto;
  width: clamp(250px, 90%, 1168px);

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
  const [selected, setSelected] = useState<ActionTypes>(ActionTypes.CLAIM)

  return (
    <Container>
      <MigrationWrap>
        <HeaderBox />
        <ActionSetter selected={selected} setSelected={setSelected} />

        <Wrapper>
          {/* {selected === ActionTypes.EASY && <CardBox />} */}
          {/* {selected === ActionTypes.MANUAL && <Table />} */}
          {selected === ActionTypes.CLAIM && <ClaimWrap />}
          {selected === ActionTypes.DASHBOARD && <MigratedTable setSelected={setSelected} />}
        </Wrapper>
      </MigrationWrap>
    </Container>
  )
}
