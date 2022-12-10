import { useMemo } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { toBN } from 'utils/numbers'
import { useSingleContractMultipleMethods, useSingleContractMultipleData } from 'state/multicall/hooks'
import { useVeDeusContract, useVeDeusMigratorContract, useVeDistContract } from 'hooks/useContract'
import { useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'

dayjs.extend(utc)

export default function useDistRewards(): number[] {
  const veDistContract = useVeDistContract()
  const nftIds = useOwnerVeDeusNFTs().results

  const callInputs = useMemo(() => (!nftIds.length ? [] : nftIds.map((id) => [id])), [nftIds])

  const results = useSingleContractMultipleData(veDistContract, 'getPendingReward', callInputs)

  return useMemo(() => {
    return results.reduce((acc: number[], value) => {
      if (!value.result) {
        acc.push(0)
        return acc
      }
      const result = value.result[0].toString()
      if (!result || result === '0') {
        acc.push(0)
      } else acc.push(toBN(result).div(1e18).toNumber())
      return acc
    }, [])
  }, [results])
}

export function useVeMigrationGlobal(): {
  paused: boolean
} {
  const contract = useVeDeusMigratorContract()

  const calls = useMemo(
    () => [
      {
        methodName: 'paused',
        callInputs: [],
      },
    ],
    []
  )

  const [pauseResult] = useSingleContractMultipleMethods(contract, calls)

  return useMemo(
    () => ({
      paused: pauseResult?.result ? pauseResult?.result[0] : false,
    }),
    [pauseResult]
  )
}

export function useVeMigrationData(nftIds: number[]): {
  migrationAmounts: string[]
  deusAmounts: string[]
  lockEnds: Date[]
} {
  const veDeusMigratorContract = useVeDeusMigratorContract()
  const veDEUSContract = useVeDeusContract()

  const nftIdsCallInputs = useMemo(() => (!nftIds.length ? [] : nftIds.map((id) => [id])), [nftIds])

  const migrationCalls = useMemo(
    () =>
      !nftIds.length
        ? []
        : [
            {
              methodName: 'valueOfVeDeusPerNFTs',
              callInputs: [nftIds],
            },
          ],
    [nftIds]
  )

  const results = useSingleContractMultipleMethods(veDeusMigratorContract, migrationCalls)

  const balanceOfNFTResults = useSingleContractMultipleData(veDEUSContract, 'locked', nftIdsCallInputs)

  return useMemo(() => {
    return {
      migrationAmounts:
        !results.length || !results[0].result || !results[0].result.length
          ? []
          : results[0].result[0].reduce((acc: string[], value: any) => {
              if (!value) return acc
              const result = value.toString()
              if (!result) return acc
              acc.push(toBN(result).div(1e18).toString())
              return acc
            }, []),
      deusAmounts: balanceOfNFTResults.reduce((acc: string[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result) return acc
        acc.push(toBN(result).div(1e18).toString())
        return acc
      }, []),
      lockEnds: balanceOfNFTResults.reduce((acc: Date[], value) => {
        if (!value.result) return acc
        const result = value.result[1].toString()
        if (!result) return acc
        acc.push(dayjs.unix(Number(result)).toDate())
        return acc
      }, []),
    }
  }, [results, balanceOfNFTResults])
}
