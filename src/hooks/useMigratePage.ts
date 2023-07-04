import { useMemo } from 'react'

import { formatUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useMigratorContract } from './useContract'
import { BN_ZERO, toBN } from 'utils/numbers'

export function useGetUserMigrations(account?: string | null): Map<string, BigNumber> {
  const migratorContract = useMigratorContract()

  const amountOutCall = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'getUserMigrations',
              callInputs: [account],
            },
          ],
    [account]
  )

  // [[user, token, amount, timestamp, block, migrationPreference]]
  const [result] = useSingleContractMultipleMethods(migratorContract, amountOutCall)
  const arg0 = !result || !result.result ? '' : result.result[0]

  const userMigrations = new Map<string, BigNumber>()
  for (const obj of arg0) {
    const key = obj.token + '_' + obj.migrationPreference
    const prevAmount: BigNumber = userMigrations.get(key) ?? BN_ZERO
    const amount: BigNumber = toBN(formatUnits(obj.amount.toString(), 18))
    userMigrations.set(key, prevAmount.plus(amount))
  }

  return userMigrations
}
