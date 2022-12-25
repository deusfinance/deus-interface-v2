import styled from 'styled-components'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/stake/ic_stake.svg'
import LiquidityPool from 'components/App/Stake/LiquidityPool'
import PoolInfo from 'components/App/Stake/PoolInfo'
import PoolShare from 'components/App/Stake/PoolShare'
import AvailableLP from 'components/App/Stake/AvailableLP'
import StakedLP from 'components/App/Stake/LPStaked'
import Reading from 'components/App/Stake/PoolDetails'
import BalanceToken from 'components/App/Stake/BalanceToken'
import { VStack } from 'components/App/Stake/common/Layout'
import { useMemo } from 'react'
import StatsHeader from 'components/StatsHeader'
import { LiquidityPool as LiquidityPoolList } from 'constants/stakingPools'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function StakingPage() {
  const pool = LiquidityPoolList[0]

  const items = useMemo(
    () => [
      { name: 'APR', value: '??%' },
      { name: 'TVL', value: '$??' },
      { name: 'Total Staked', value: `?? ${pool?.lpToken?.symbol}` },
    ],
    [pool?.lpToken?.symbol]
  )

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={185} height={133} alt={`Logo`} />
        <StatsHeader items={items} />
      </Hero>

      <TopWrapper>
        {pool?.tokens.length > 1 && (
          <VStack>
            <BalanceToken pool={pool} />
            <LiquidityPool pool={pool} />
          </VStack>
        )}
        <div style={{ width: '100%' }}>
          <AvailableLP pool={pool} />
          <StakedLP />
          <PoolShare pool={pool} />
          <PoolInfo pool={pool} />
          <Reading />
        </div>
      </TopWrapper>
    </Container>
  )
}
