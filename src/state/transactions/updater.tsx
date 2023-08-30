import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch, useAppSelector } from 'state'
import { useAddPopup } from 'state/application/hooks'
import LibUpdater from 'lib/hooks/transactions/updater'
// import { L2_CHAIN_IDS } from 'constants/chains'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'

import { checkedTransaction, finalizeTransaction } from './actions'
import { SerializableTransactionReceipt } from './types'

export default function Updater() {
  const { chainId } = useWeb3React()
  // const isL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))

  const transactions = useAppSelector((state) => state.transactions)

  // Show popup on confirm
  const addPopup = useAddPopup()

  const dispatch = useAppDispatch()
  const onCheck = useCallback(
    ({ chainId, hash, blockNumber }: { chainId: number; hash: string; blockNumber: number }) =>
      dispatch(checkedTransaction({ chainId, hash, blockNumber })),
    [dispatch]
  )

  const onReceipt = useCallback(
    ({ chainId, hash, receipt }: { chainId: number; hash: string; receipt: SerializableTransactionReceipt }) => {
      dispatch(
        finalizeTransaction({
          chainId,
          hash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        })
      )

      addPopup(
        {
          txn: { hash, success: receipt.status === 1, summary: transactions[hash]?.summary },
        },
        hash,
        DEFAULT_TXN_DISMISS_MS
      )
    },
    [addPopup, dispatch, transactions]
  )

  const pendingTransactions = useMemo(() => (chainId ? transactions[chainId] ?? {} : {}), [chainId, transactions])

  return <LibUpdater pendingTransactions={pendingTransactions} onCheck={onCheck} onReceipt={onReceipt} />
}
