import React from 'react'
import styled from 'styled-components'

import { LiquidityType, Stakings } from 'constants/stakingPools'

import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { useWeb3React } from '@web3-react/core'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { usePoolInfo, useRemoveLiquidity } from 'hooks/useStablePoolInfo'
import { useUserInfo } from 'hooks/useStakingInfo'

import { formatBalance, formatDollarAmount } from 'utils/numbers'

import ImageWithFallback from 'components/ImageWithFallback'
import { ContentTable, Label, TableHeader, Value, VStack } from './common/Layout'
import Container from './common/Container'

const Wrapper = styled(VStack)`
  padding: 12px;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 12px;
`

export default function PoolShare({ pool }: { pool: LiquidityType }) {
  const { account } = useWeb3React()

  const { lpToken: currency, tokens } = pool
  const tokensAddress = tokens.map((token) => token.address)
  const tokensLogo = useCurrencyLogos(tokensAddress)

  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)?.toSignificant()
  const poolInfo = usePoolInfo(pool)
  const virtualPrice = poolInfo?.virtualPrice || 1
  const tokenPrice = pool.priceHook()
  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const { depositAmount, totalDepositedAmount } = useUserInfo(stakingPool)

  const shares = Number(depositAmount) + Number(currencyBalance)
  const amountsOut = useRemoveLiquidity(pool, shares ? shares.toString() : '0')

  return (
    <Container>
      <Wrapper>
        <TableHeader>
          <p>Your Share</p>
          <p>{((shares / totalDepositedAmount) * 100).toFixed(6)}% of Pool</p>
        </TableHeader>
        <ContentTable>
          <Label>
            <p>Value:</p>
          </Label>
          <Value>
            {formatDollarAmount(
              (Number(depositAmount) + Number(currencyBalance)) * virtualPrice * parseFloat(tokenPrice)
            )}
          </Value>
        </ContentTable>
        {pool?.tokens.length > 1 ? (
          <ContentTable>
            <Label>
              <p>{stakingPool.token?.symbol} Amount:</p>
            </Label>
            <Value>{formatBalance(Number(depositAmount) + Number(currencyBalance))}</Value>
          </ContentTable>
        ) : (
          <ContentTable>
            <Label>
              <ImageWithFallback src={tokensLogo[0]} alt={''} width={21} height={21} />
              <p>{tokens[0].symbol}</p>
            </Label>
            <Value>{formatBalance(Number(depositAmount) + Number(currencyBalance))}</Value>
          </ContentTable>
        )}
        {pool?.tokens.length > 1 &&
          tokensLogo?.map((logo, index) => (
            <ContentTable key={index}>
              <Label>
                <ImageWithFallback key={index} src={logo} alt={''} width={21} height={21} />
                <p>{tokens[index].symbol}</p>
              </Label>
              <Value> {amountsOut[index] ? formatBalance(amountsOut[index]) : 0} </Value>
            </ContentTable>
          ))}
      </Wrapper>
    </Container>
  )
}
