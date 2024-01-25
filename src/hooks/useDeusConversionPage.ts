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

  const [pendingLegacyDeusConversions, pendingXDeusConversions] = useSingleContractMultipleMethods(
    deusConversionContract,
    amountOutCall
  )

  return [
    pendingLegacyDeusConversions?.result ? pendingLegacyDeusConversions?.result : '',
    pendingXDeusConversions?.result ? pendingXDeusConversions?.result : '',
  ]
}

export function useLastConversionEndTime() {
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
          ],
    [account]
  )

  const [lastConversionEndTime] = useSingleContractMultipleMethods(deusConversionContract, amountOutCall)
  return [lastConversionEndTime?.result ? lastConversionEndTime?.result : '']
}
