import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Stakings } from 'constants/stakingPools'

import { Row, RowBetween } from 'components/Row'
import Table, { Cell } from 'components/App/Stake/Table'
import Hero from 'components/Hero'
import { Title } from 'components/App/StableCoin'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1168px);
  margin-top: 30px;

  & > * {
    &:nth-child(3) {
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

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 50%;
  `};
`

export default function Stake() {
  function getUpperRow() {
    return (
      <UpperRow>
        <Row>
          <Cell style={{ height: 'fit-content', color: '#6F7380', fontWeight: 'medium' }} width="25%">
            Pools
          </Cell>
          <Cell style={{ height: 'fit-content', color: '#6F7380', fontWeight: 'medium' }} width="10%">
            APR
          </Cell>
          <Cell style={{ height: 'fit-content', color: '#6F7380' }} width="18%">
            TVL
          </Cell>
          <Cell style={{ height: 'fit-content', textAlign: 'left', color: '#6F7380' }}>Reward Tokens</Cell>
        </Row>
      </UpperRow>
    )
  }

  return (
    <Container>
      <Hero>
        <Title> Stake xDEUS</Title>
      </Hero>
      <Wrapper>
        {getUpperRow()}
        <Table isMobile={isMobile} stakings={Stakings} />
      </Wrapper>
    </Container>
  )
}
