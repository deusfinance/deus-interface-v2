import { useMemo } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { toBN } from 'utils/numbers'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import { useVeDistContract, useVeDeusContract } from 'hooks/useContract'
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

export function useVeMigrationData(nftIds: number[]): {
  lockEnds: Date[]
} {
  const veDEUSContract = useVeDeusContract()

  const nftIdsCallInputs = useMemo(() => (!nftIds.length ? [] : nftIds.map((id) => [id])), [nftIds])

  const balanceOfNFTResults = useSingleContractMultipleData(veDEUSContract, 'locked', nftIdsCallInputs)

  return useMemo(() => {
    return {
      lockEnds: balanceOfNFTResults.reduce((acc: Date[], value) => {
        if (!value.result) return acc
        const result = value.result[1].toString()
        if (!result) return acc
        acc.push(dayjs.unix(Number(result)).toDate())
        return acc
      }, []),
    }
  }, [balanceOfNFTResults])
}
