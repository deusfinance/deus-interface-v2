import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { lighten } from 'polished'
import { useWeb3React } from '@web3-react/core'

import { useAppSelector } from 'state'
import { FALLBACK_CHAIN_ID, APP_CHAIN_IDS } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { getConnection } from 'connection/utils'
import { truncateAddress } from 'utils/address'
import useRpcChangerCallback from 'lib/hooks/useRpcChangerCallback'

import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/types'
import { useToggleWalletModal } from 'state/application/hooks'

import WalletModal from 'components/WalletModal'
import { NavButton } from 'components/Button'
import { Connected as ConnectedIcon } from 'components/Icons'
import ImageWithFallback from 'components/ImageWithFallback'
import { Button } from 'components/Web3Network'
import { RowCenter } from 'components/Row'

const ConnectButtonWrap = styled.div`
  border: none;
  background: ${({ theme }) => theme.deusColor};
  padding: 1px;
  border-radius: 8px;
  width: 148px;
  height: 36px;
  &:hover,
  &:focus {
    border: none;
    cursor: pointer;
  }
`
const ConnectButton = styled(RowCenter)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
  height: 100%;
  width: 100%;
  white-space: nowrap;
`
const ConnectButtonText = styled.span`
  background: -webkit-linear-gradient(0deg, #0badf4 -10.26%, #30efe4 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const ErrorButton = styled(NavButton)`
  border: 1px solid ${({ theme }) => theme.red1};
  padding: 0 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => lighten(0.05, theme.bg1)};
  }
`

const Text = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`

// We want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function Web3StatusInner({ ENSName }: { ENSName?: string }) {
  const { account, connector, chainId } = useWeb3React()
  const connectionType = getConnection(connector).type

  const Chain = ChainInfo[chainId || FALLBACK_CHAIN_ID] ?? ChainInfo[FALLBACK_CHAIN_ID]

  const toggleWalletModal = useToggleWalletModal()
  const rpcChangerCallback = useRpcChangerCallback()
  const error = useAppSelector((state) => state.connection.errorByConnectionType[connectionType])

  const showCallbackError: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return !APP_CHAIN_IDS.includes(chainId)
  }, [chainId, account])

  if (showCallbackError) {
    return (
      <ErrorButton onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
        <ImageWithFallback src={Chain.logoUrl} alt={Chain.label} width={22} height={22} />
        {/* <Text>Wrong Network</Text> */}
      </ErrorButton>
    )
  } else if (account) {
    return (
      <Button style={{ cursor: 'pointer' }} onClick={toggleWalletModal}>
        <ConnectedIcon />
        <Text>{ENSName || truncateAddress(account)}</Text>
      </Button>
    )
  } else if (error) {
    return (
      <ErrorButton onClick={toggleWalletModal}>
        <Text>{'Error'}</Text>
      </ErrorButton>
    )
  } else {
    return (
      <ConnectButtonWrap onClick={toggleWalletModal}>
        <ConnectButton>
          <ConnectButtonText>Connect Wallet</ConnectButtonText>
        </ConnectButton>
      </ConnectButtonWrap>
    )
  }
}

export default function Web3Status() {
  const { ENSName, account } = useWeb3React()

  //todo:why
  const ref = useRef<HTMLDivElement>(null)
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter(isTransactionRecent)
      .sort(newTransactionsFirst)
      .filter((tx) => tx.from == account)
  }, [allTransactions, account])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <span ref={ref}>
      <Web3StatusInner ENSName={ENSName ?? undefined} />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </span>
  )
}
