import { useMemo } from 'react'

import { formatUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useMigratorContract } from './useContract'
import { BN_ZERO, toBN } from 'utils/numbers'

export function useGetUserMigrations(
  ratio: number,
  account?: string | null
): { userMigrations: Map<string, BigNumber>; userTotalMigration: BigNumber } {
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
  let userTotalMigration = BN_ZERO

  for (const obj of arg0) {
    if (obj.migrationPreference === 0) {
      const key = obj.token + '_1' // for DEUS
      const prevAmount: BigNumber = userMigrations.get(key) ?? BN_ZERO
      const amount: BigNumber = toBN(formatUnits(obj.amount.toString(), 18)).times(ratio)
      userMigrations.set(key, prevAmount.plus(amount))
      userTotalMigration = userTotalMigration.plus(amount)

      const key2 = obj.token + '_2' // for SYMM
      const prevAmount2: BigNumber = userMigrations.get(key2) ?? BN_ZERO
      const amount2: BigNumber = toBN(formatUnits(obj.amount.toString(), 18)).minus(amount)
      userMigrations.set(key2, prevAmount2.plus(amount2))
      userTotalMigration = userTotalMigration.plus(amount2)
    } else {
      const key = obj.token + '_' + obj.migrationPreference
      const prevAmount: BigNumber = userMigrations.get(key) ?? BN_ZERO
      const amount: BigNumber = toBN(formatUnits(obj.amount.toString(), 18))
      userMigrations.set(key, prevAmount.plus(amount))
      userTotalMigration = userTotalMigration.plus(amount)
    }
  }

  return { userMigrations, userTotalMigration }
}

export function useGetEarlyMigrationDeadline(): string {
  const migratorContract = useMigratorContract()

  const amountOutCall = useMemo(
    () => [
      {
        methodName: 'earlyMigrationDeadline',
        callInputs: [],
      },
    ],
    []
  )

  const [result] = useSingleContractMultipleMethods(migratorContract, amountOutCall)
  const earlyMigrationDeadline = !result || !result.result ? '' : result.result[0]

  return earlyMigrationDeadline
}
