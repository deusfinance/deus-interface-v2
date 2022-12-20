import { useMemo } from 'react'

import { useStablePoolContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { StablePools } from 'constants/sPools'
import { formatUnits } from '@ethersproject/units'
import { toBN } from 'utils/numbers'

const VDEUS_TOKEN_INDEX = 0
const DEUS_TOKEN_INDEX = 1

export function useVDeusStats(): {
  vDeusPeg: number
  vDeusBalance: number
  deusBalance: number
} {
  const contract = useStablePoolContract(StablePools[0])

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
    ],
    []
  )

  const [vdeusBalanceRaw, deusBalanceRaw] = useSingleContractMultipleMethods(contract, methodCalls)

  const { vDeusBalance, deusBalance } = useMemo(() => {
    return {
      vDeusBalance: vdeusBalanceRaw?.result ? toBN(formatUnits(vdeusBalanceRaw.result[0], 18)).toNumber() : 0,
      deusBalance: deusBalanceRaw?.result ? toBN(formatUnits(deusBalanceRaw.result[0], 18)).toNumber() : 0,
    }
  }, [vdeusBalanceRaw, deusBalanceRaw])

  const vDeusPeg = useMemo(() => {
    return !deusBalance || !vDeusBalance ? 0 : deusBalance / vDeusBalance
  }, [vDeusBalance, deusBalance])

  return { vDeusPeg, vDeusBalance, deusBalance }
}
