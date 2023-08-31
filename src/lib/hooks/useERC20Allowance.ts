import { useEffect, useMemo, useState } from 'react'
import { Token } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'

import { toBN, BN_TEN } from 'utils/numbers'

import { useSingleCallResult } from 'lib/hooks/multicall'
import { useERC20Contract } from 'hooks/useContract'

export function useERC20Allowance(
  token?: Token,
  owner?: string,
  spender?: string
): {
  tokenAllowance: BigNumber | undefined
  isSyncing: boolean
} {
  const contract = useERC20Contract(token?.address, false)
  const inputs = useMemo(() => [owner, spender], [owner, spender])

  // If there is no allowance yet, re-check next observed block.
  // This guarantees that the tokenAllowance is marked isSyncing upon approval and updated upon being synced.
  const [blocksPerFetch, setBlocksPerFetch] = useState<1>()
  const { result, syncing: isSyncing } = useSingleCallResult(contract, 'allowance', inputs, { blocksPerFetch }) as {
    result: Awaited<ReturnType<NonNullable<typeof contract>['allowance']>> | undefined
    syncing: boolean
  }

  const rawAmount = result?.toString() // convert to a string before using in a hook, to avoid spurious rerenders
  const allowance = useMemo(
    () => (token && rawAmount ? toBN(rawAmount).div(BN_TEN.pow(token.decimals)) : undefined),
    [token, rawAmount]
  )
  useEffect(() => setBlocksPerFetch(allowance?.isEqualTo(0) ? 1 : undefined), [allowance])

  return useMemo(() => ({ tokenAllowance: allowance, isSyncing }), [allowance, isSyncing])
}
