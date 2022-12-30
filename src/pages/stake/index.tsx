import styled from 'styled-components'

import { LiquidityPool as LiquidityPoolList } from 'constants/stakingPools'
import LiquidityPool from 'components/App/Stake/LiquidityPool'
import PoolInfo from 'components/App/Stake/PoolInfo'
import PoolShare from 'components/App/Stake/PoolShare'
import AvailableLP from 'components/App/Stake/AvailableLP'
import StakedLP from 'components/App/Stake/LPStaked'
import Reading from 'components/App/Stake/PoolDetails'
import BalanceToken from 'components/App/Stake/BalanceToken'
import { VStack } from 'components/App/Stake/common/Layout'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div<{ isMultipleColumns: boolean }>`
  display: ${({ isMultipleColumns }) => (isMultipleColumns ? 'grid' : 'flex')};
  grid-template-columns: 480px 480px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   display: flex;
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function StakingPage() {
  const pool = LiquidityPoolList[0]

  return (
    <Container>
      <TopWrapper isMultipleColumns={pool?.tokens.length > 1}>
        {pool?.tokens.length > 1 && (
          <VStack style={{ width: '100%' }}>
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
