import { useMemo } from 'react'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useAxlGatewayContract } from './useContract'
import useWeb3React from './useWeb3'

export function useDeposits(): string {
  const { account } = useWeb3React()
  const bridgeContract = useAxlGatewayContract()

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
