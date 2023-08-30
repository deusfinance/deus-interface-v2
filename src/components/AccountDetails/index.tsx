import { useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from 'state'
import {
  getConnection,
  getConnectionName,
  getIsCoinbaseWallet,
  getIsMetaMaskWallet,
  getIsOKXWallet,
} from 'connection/utils'
import { ExplorerDataType } from 'utils/explorers'
import { truncateAddress } from 'utils/address'
import { clearAllTransactions } from 'state/transactions/actions'

import { Connected as ConnectedIcon, Link } from 'components/Icons'
import { ExplorerLink } from 'components/Link'
import Copy from 'components/Copy'
import Transaction from './Transaction'
import { RowBetween, RowEnd, RowStart } from 'components/Row'

//todo: read this
import { removeConnectedWallet } from 'state/wallet/reducer'
import { updateSelectedWallet } from 'state/user/actions'
import { isMobile } from 'utils/userAgent'

const AccountWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  position: relative;
  background: ${({ theme }) => theme.bg4};
  padding: 8px 12px;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 1rem;
    height: 100px;
  `};
`

const Row = styled(RowBetween)`
  flex-flow: row nowrap;
`

const Connected = styled.button`
  color: ${({ theme }) => theme.text1};
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `};
`

const ButtonsWrapper = styled(RowEnd)`
  width: unset;
  flex-direction: row-reverse;
  gap: 10px;
`

const ActionButton = styled.button<{
  hide?: boolean
  disable?: boolean
}>`
  border-radius: 4px;
  outline: none;
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  font-size: 10px;
  padding: 4px 12px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg5};
  width: 70px;
  height: 20px;

  &:hover {
    background: ${({ theme }) => theme.bg3};
    cursor: pointer;
  }

  ${(props) =>
    props.disable &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}
`

const ClearButton = styled(ActionButton)`
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  font-size: 12px;

  color: ${({ theme }) => theme.text2};
`

const MiddleRow = styled(RowStart)`
  color: ${({ theme }) => theme.text1};
  gap: 5px;
  font-size: 14px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 12px;
  `}
`

const AddressLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  font-size: 14px;
  white-space: nowrap;
  text-align: right;
  text-decoration-line: underline;

  color: ${({ theme }) => theme.text1};

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.text1)};
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left:4px;
      font-size: 8px;
  `}
`

const TransactionsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  background: ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text3};
  padding: 40px 60px;

  overflow: scroll;
  gap: 5px;

  /* & > * {
    &:first-child {
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      font-size: 0.8rem;
      margin-bottom: 8px;
      padding: 40px auto;
    }
    &:not(:first-child) {
      max-height: 200px;
    }
  } */
`

const AllTransactions = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text3};
  padding: 16px 12px;

  overflow: scroll;
  gap: 4px;

  & > * {
    &:first-child {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 8px;
      align-items: baseline;
    }
    &:not(:first-child) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 200px;
      margin-bottom: 12px;
    }
  }
`

const RecentTransactions = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

function renderTransactions(transactions: string[]) {
  return (
    <>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </>
  )
}

interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  openOptions: () => void
  ENSName?: string
}

export default function AccountDetails({
  pendingTransactions,
  confirmedTransactions,
  openOptions,
  ENSName,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useWeb3React()
  const connectionType = getConnection(connector).type

  const dispatch = useAppDispatch()

  const hasMetaMaskExtension = getIsMetaMaskWallet()
  const hasOKXxtension = getIsOKXWallet()
  const hasCoinbaseExtension = getIsCoinbaseWallet()
  const isInjectedMobileBrowser = (hasOKXxtension || hasMetaMaskExtension || hasCoinbaseExtension) && isMobile

  function formatConnectorName() {
    return <Connected>Connected with {getConnectionName(connectionType, hasMetaMaskExtension)}</Connected>
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <AccountWrapper>
        <Row>
          {formatConnectorName()}
          <ButtonsWrapper>
            {!isInjectedMobileBrowser && (
              <ActionButton
                onClick={() => {
                  const walletType = getConnectionName(getConnection(connector).type)
                  if (connector.deactivate) {
                    connector.deactivate()
                  } else {
                    connector.resetState()
                  }

                  dispatch(updateSelectedWallet({ wallet: undefined }))
                  dispatch(removeConnectedWallet({ account, walletType }))
                  openOptions()
                }}
              >
                Disconnect
              </ActionButton>
            )}
            <ActionButton
              onClick={() => {
                openOptions()
              }}
            >
              Change
            </ActionButton>
          </ButtonsWrapper>
        </Row>
        <MiddleRow>
          {connector && <ConnectedIcon style={{ minWidth: '7px' }} />}
          {ENSName ? ENSName : account && truncateAddress(account)}
          {account && <Copy toCopy={account} text={''} />}
          {chainId && account && (
            <RowEnd>
              <ExplorerLink type={ExplorerDataType.ADDRESS} chainId={chainId} value={account}>
                <AddressLink>
                  View on Explorer
                  <Link style={{ transform: 'translateY(1px)' }} />
                </AddressLink>
              </ExplorerLink>
            </RowEnd>
          )}
        </MiddleRow>
      </AccountWrapper>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <AllTransactions>
          <div>
            <RecentTransactions>Recent Transactions</RecentTransactions>
            <ClearButton onClick={clearAllTransactionsCallback}>Clear All</ClearButton>
          </div>
          <div>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </div>
        </AllTransactions>
      ) : (
        <TransactionsWrapper>
          <div>Your transactions will appear here...</div>
        </TransactionsWrapper>
      )}
    </>
  )
}
