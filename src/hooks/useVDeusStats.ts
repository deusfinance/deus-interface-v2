import { useMemo } from 'react'

import { useStablePoolContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'lib/hooks/multicall'
import { formatUnits } from '@ethersproject/units'
import { BN_TEN, toBN } from 'utils/numbers'
import { LiquidityPool } from 'constants/stakingPools'

const VDEUS_TOKEN_INDEX = 0
const DEUS_TOKEN_INDEX = 1
const ONE = toBN(1).times(BN_TEN.pow(18)).toFixed(0) // 10 ** 18, to be used as input to calculate swap ratio

export function useVDeusStats(): {
  swapRatio: number
  vDeusBalance: number
  deusBalance: number
} {
  const contract = useStablePoolContract(LiquidityPool[0])

  const methodCalls = useMemo(
    () => [
      {
        methodName: 'getTokenBalance',
        callInputs: [VDEUS_TOKEN_INDEX],
      },
      {
        methodName: 'getTokenBalance',
        callInputs: [DEUS_TOKEN_INDEX],
      },
      {
        methodName: 'calculateSwap',
        callInputs: [VDEUS_TOKEN_INDEX, DEUS_TOKEN_INDEX, ONE],
      },
    ],
    []
  )

  const [vdeusBalanceRaw, deusBalanceRaw, swapRatioRaw] = useSingleContractMultipleMethods(contract, methodCalls)

  const { vDeusBalance, deusBalance, swapRatio } = useMemo(() => {
    return {
      vDeusBalance: vdeusBalanceRaw?.result ? toBN(formatUnits(vdeusBalanceRaw.result[0], 18)).toNumber() : 0,
      deusBalance: deusBalanceRaw?.result ? toBN(formatUnits(deusBalanceRaw.result[0], 18)).toNumber() : 0,
      swapRatio: swapRatioRaw?.result ? toBN(formatUnits(swapRatioRaw.result[0], 18)).toNumber() : 0,
    }
  }, [vdeusBalanceRaw, deusBalanceRaw, swapRatioRaw])

  return { swapRatio, vDeusBalance, deusBalance }
}
