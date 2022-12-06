import { useMemo } from 'react'

import { toBN } from 'utils/numbers'
import { useSingleContractMultipleMethods, useSingleContractMultipleData } from 'state/multicall/hooks'
import { useVeDeusMigratorContract, useVeDistContract } from 'hooks/useContract'
import { useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'

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

export function useVeMigrationData(): {
  paused: boolean
} {
  const contract = useVeDeusMigratorContract()
  const nftIds = useOwnerVeDeusNFTs().results
  const nftIdsCallInputs = useMemo(() => (!nftIds.length ? [] : nftIds.map((id) => [id])), [nftIds])

  const calls = useMemo(
    () => [
      {
        methodName: 'paused',
        callInputs: [],
      },
      {
        methodName: 'valueOfVeDeusNFTs',
        callInputs: nftIdsCallInputs,
      },
    ],
    [nftIdsCallInputs]
  )

  const [pauseResult] = useSingleContractMultipleMethods(contract, calls)

  return useMemo(
    () => ({
      paused: pauseResult?.result ? pauseResult?.result[0] : false,
    }),
    [pauseResult]
  )
}
