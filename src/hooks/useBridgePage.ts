import { useMemo } from 'react'

import { useSingleContractMultipleMethods } from 'lib/hooks/multicall'
import { useBridgeContract } from './useContract'
import { useWeb3React } from '@web3-react/core'

export function useDeposits(): string {
  const { account } = useWeb3React()
  const bridgeContract = useBridgeContract()

  const amountOutCall = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'deposits',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [result] = useSingleContractMultipleMethods(bridgeContract, amountOutCall)
  return !result || !result.result ? '' : result.result[0]
}
