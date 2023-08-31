import { BigNumber } from '@ethersproject/bignumber'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'

import { useMultiCall3Contract } from 'hooks/useContract'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useMultiCall3Contract()
  const resultStr: string | undefined = useSingleCallResult(
    multicall,
    'getCurrentBlockTimestamp'
  )?.result?.[0]?.toString()
  return useMemo(() => (typeof resultStr === 'string' ? BigNumber.from(resultStr) : undefined), [resultStr])
}
