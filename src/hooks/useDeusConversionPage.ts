import { useMemo } from 'react'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useDeusConversionContract } from './useContract'
import useWeb3React from './useWeb3'

export function useCooldownDuration(): string {
  const deusConversionContract = useDeusConversionContract()

  const amountOutCall = useMemo(
    () => [
      {
        methodName: 'cooldownDuration',
        callInputs: [],
      },
    ],
    []
  )

  const [result] = useSingleContractMultipleMethods(deusConversionContract, amountOutCall)
  return !result || !result.result ? '' : result.result[0]
}

export function usePendingConversions() {
  const { account } = useWeb3React()
  const deusConversionContract = useDeusConversionContract()

  const amountOutCall = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'lastConversionEndTime',
              callInputs: [account],
            },
            {
              methodName: 'pendingLegacyDeusConversions',
              callInputs: [account],
            },
            {
              methodName: 'pendingXDeusConversions',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [lastConversionEndTime, pendingLegacyDeusConversions, pendingXDeusConversions] =
    useSingleContractMultipleMethods(deusConversionContract, amountOutCall)

  return [
    lastConversionEndTime?.result ? lastConversionEndTime?.result : '',
    pendingLegacyDeusConversions?.result ? pendingLegacyDeusConversions?.result : '',
    pendingXDeusConversions?.result ? pendingXDeusConversions?.result : '',
  ]
}
