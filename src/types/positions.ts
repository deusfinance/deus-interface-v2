import BigNumber from 'bignumber.js'

export type Position = {
  id: number
  poolAddress: string
  gaugeAddress: string

  token0Address: string
  token1Address: string

  tickUpper: number
  tickLower: number
  fee: number

  liquidity: BigNumber
  boostedLiquidity: BigNumber

  tokensOwed0: BigNumber
  tokensOwed1: BigNumber
  feeGrowthInside0LastX128: BigNumber
  feeGrowthInside1LastX128: BigNumber

  veRamTokenId: number
}
