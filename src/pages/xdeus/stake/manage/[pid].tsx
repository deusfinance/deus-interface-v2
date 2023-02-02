import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { LiquidityPool as LiquidityPoolList, Stakings } from 'constants/stakingPools'

import { formatDollarAmount } from 'utils/numbers'

import { useUserInfo } from 'hooks/useStakingInfo'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { usePoolBalances } from 'hooks/useStablePoolInfo'

import LiquidityPool from 'components/App/Staking/LiquidityPool'
import PoolInfo from 'components/App/Staking/PoolInfo'
import PoolShare from 'components/App/Staking/PoolShare'
import AvailableLP from 'components/App/Staking/AvailableLP'
import StakedLP from 'components/App/Staking/LPStaked'
import { VStack } from 'components/App/Staking/common/Layout'
import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { Title } from 'components/App/StableCoin'
import BalanceToken from 'components/App/Staking/BalanceToken'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div<{ isMultipleColumns: boolean }>`
  display: ${({ isMultipleColumns }) => (isMultipleColumns ? 'grid' : 'flex')};
  grid-template-columns: 480px 480px;
  min-width: 480px;
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
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)

  const liquidityPool = useMemo(() => {
    return LiquidityPoolList.find((pool) => pool.id === pidNumber) || LiquidityPoolList[0]
  }, [pidNumber])

  const stakingPool = useMemo(() => {
    return Stakings.find((p) => p.id === liquidityPool.id) || Stakings[0]
  }, [liquidityPool])

  const poolBalances = usePoolBalances(liquidityPool)
  const { totalDepositedAmount } = useUserInfo(stakingPool)
  const { swapRatio } = useVDeusStats()

  const priceToken = liquidityPool.priceToken?.symbol ?? ''
  const price = liquidityPool.priceHook()

  const totalLockedValue = poolBalances[1] * 2 * Number(price)

  // generate total APR if pools have secondary APRs
  const primaryApy = stakingPool.aprHook(stakingPool)
  const secondaryApy = stakingPool.secondaryAprHook(liquidityPool, stakingPool)
  const totalApy = primaryApy + secondaryApy

  // generate respective tooltip info if pools have more than 1 reward tokens
  const primaryTooltipInfo = primaryApy.toFixed(0) + '% ' + stakingPool.rewardTokens[0].symbol
  const secondaryTooltipInfo = stakingPool.hasSecondaryApy
    ? ' + ' + secondaryApy.toFixed(0) + '% ' + stakingPool.rewardTokens[1].symbol
    : ''

  const toolTipInfo = primaryTooltipInfo + secondaryTooltipInfo

  // fetch TVL for xDEUS single staking pool
  const isSingleStakingPool = useMemo(() => {
    return stakingPool.isSingleStaking
  }, [stakingPool])

  const totalDepositedValue = useMemo(() => {
    return totalDepositedAmount * swapRatio * parseFloat(price)
  }, [price, totalDepositedAmount, swapRatio])

  const tvl = useMemo(() => {
    return isSingleStakingPool ? formatDollarAmount(totalDepositedValue) : formatDollarAmount(totalLockedValue)
  }, [isSingleStakingPool, totalDepositedValue, totalLockedValue])

  const items = [
    {
      name: 'APR',
      value: totalApy.toFixed(0) + '%',
      hasTooltip: true,
      toolTipInfo,
    },
    { name: 'TVL', value: tvl },
    { name: priceToken + ' Price', value: formatDollarAmount(parseFloat(price)) },
  ]

  function onSelect(pid: number) {
    router.push(`/xdeus/stake/manage/${pid}`)
  }

  return (
    <Container>
      <Hero>
        <Title> Stake xDEUS</Title>
        <StatsHeader pid={pidNumber} onSelectDropDown={onSelect} items={items} />
      </Hero>

      <TopWrapper isMultipleColumns={!isSingleStakingPool}>
        {!isSingleStakingPool && (
          <VStack style={{ width: '100%' }}>
            <BalanceToken pool={liquidityPool} />
            <LiquidityPool pool={liquidityPool} />
          </VStack>
        )}
        <VStack style={{ width: '100%' }}>
          <AvailableLP pool={liquidityPool} />
          <StakedLP pid={pidNumber} />
          <PoolShare pool={liquidityPool} />
          <PoolInfo pool={liquidityPool} />
          {/* <Reading /> */}
        </VStack>
      </TopWrapper>
    </Container>
  )
}
