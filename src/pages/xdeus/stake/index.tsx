import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { ExternalStakings, Stakings, StakingType } from 'constants/stakingPools'

import { Row, RowBetween } from 'components/Row'
import Table, { Cell } from 'components/App/Stake/Table'
import Hero from 'components/Hero'
import { Title } from 'components/App/StableCoin'
import { ExternalLink } from 'components/Link'
import ExternalLinkImage from '/public/static/images/pages/common/down.svg'
import Image from 'next/image'

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
const ReadMoreContainer = styled(Cell)`
  width: fit-content;
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
  position: absolute;
  right: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  position: relative;
  `};
  a {
    color: ${({ theme }) => theme.text2};
    &:hover {
      color: ${({ theme }) => theme.text2};
      text-decoration: underline;
    }
  }
`

export default function Stake() {
  const list = useMemo(() => {
    const allStakings = Stakings.concat(ExternalStakings as unknown as StakingType)
    return allStakings.map((pool) => ({ ...pool, value: pool.name }))
  }, [])

  function getUpperRow() {
    return (
      <UpperRow>
        <Row style={{ position: 'relative' }}>
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
          <ReadMoreContainer>
            <ExternalLink href="https://docs.deus.finance/staking-and-farming/deus-finance">
              Read more <Image alt="read more" width={10} height={10} src={ExternalLinkImage} />
            </ExternalLink>
          </ReadMoreContainer>
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
        <Table isMobile={isMobile} stakings={list as unknown as StakingType[]} />
      </Wrapper>
    </Container>
  )
}
