import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ArrowLeft, X } from 'react-feather'
import { networkConnection } from 'connection'
import {
  getConnection,
  getConnectionName,
  getIsCoinbaseWallet,
  getIsInjected,
  getIsMetaMaskWallet,
  getIsOKXWallet,
} from 'connection/utils'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { isSupportedChain } from 'constants/chains'
import usePrevious from 'lib/hooks/usePrevious'
import { updateConnectionError } from 'state/connection/reducer'
import { updateSelectedWallet } from 'state/user/actions'
import { useConnectedWallets } from 'state/wallet/hooks'

import { useModalOpen, useToggleWalletModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

import PendingView from 'components/WalletModal/PendingView'
import { Modal, ModalHeader } from 'components/Modal'
import AccountDetails from 'components/AccountDetails'
import { CoinbaseWalletOption, OpenCoinbaseWalletOption } from './CoinbaseWalletOption'
import { InjectedOption, InstallMetaMaskOption, InstallOKXOption, MetaMaskOption, OKXOption } from './InjectedOption'
import { useAppDispatch, useAppSelector } from 'state'
import { WalletConnectV2Option } from './WalletConnectOption'
import { AutoColumn } from 'components/Column'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: ${({ theme }) => theme.red1};
  }
`

const CloseColor = styled(X)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background-color: ${({ theme }) => theme.bg0};
  outline: ${({ theme }) => `1px solid ${theme.bg1}`};
  box-shadow: ${({ theme }) => theme.shadow1};
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  display: flex;
  flex-flow: rpw nowrap;
  padding: 1rem 1rem;
  font-weight: 600;
  size: 16px;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.text2 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg0};
  padding: 0 1rem 1rem 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`

const UpperSection = styled.div`
  position: relative;
  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }
  h5:last-child {
    margin-bottom: 0px;
  }
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  const dispatch = useAppDispatch()
  const { connector, account, chainId } = useWeb3React()
  const previousAccount = usePrevious(account)
  const [connectedWallets, addWalletToConnectedWallets] = useConnectedWallets()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<string | undefined>(account)

  const [pendingConnector, setPendingConnector] = useState<Connector | undefined>()
  const pendingError = useAppSelector((state) =>
    pendingConnector ? state.connection.errorByConnectionType[getConnection(pendingConnector).type] : undefined
  )

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()

  const openOptions = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS)
  }, [setWalletView])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS)
    }
  }, [walletModalOpen, setWalletView, account])

  // close on connection, when logged out before
  useEffect(() => {
    if (account && account !== previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  useEffect(() => {
    if (pendingConnector && walletView !== WALLET_VIEWS.PENDING) {
      updateConnectionError({ connectionType: getConnection(pendingConnector).type, error: undefined })
      setPendingConnector(undefined)
    }
  }, [pendingConnector, walletView])

  // Keep the network connector in sync with any active user connector to prevent chain-switching on wallet disconnection.
  useEffect(() => {
    if (chainId && isSupportedChain(chainId) && connector !== networkConnection.connector) {
      networkConnection.connector.activate(chainId)
    }
  }, [chainId, connector])

  // When new wallet is successfully set by the user, trigger logging of Amplitude analytics event.
  useEffect(() => {
    if (account && account !== lastActiveWalletAddress) {
      const walletType = getConnectionName(getConnection(connector).type)
      const isReconnect =
        connectedWallets.filter((wallet) => wallet.account === account && wallet.walletType === walletType).length > 0
      if (!isReconnect) addWalletToConnectedWallets({ account, walletType })
    }
    setLastActiveWalletAddress(account)
  }, [connectedWallets, addWalletToConnectedWallets, lastActiveWalletAddress, account, connector, chainId])

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connectionType = getConnection(connector).type

      try {
        setPendingConnector(connector)
        setWalletView(WALLET_VIEWS.PENDING)
        dispatch(updateConnectionError({ connectionType, error: undefined }))
        console.log('Nome')

        await connector.activate()
        console.log('Come')

        dispatch(updateSelectedWallet({ wallet: connectionType }))
      } catch (error) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(updateConnectionError({ connectionType, error: error.message }))
      }
    },
    [dispatch]
  )

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isInjected = getIsInjected()
    const hasMetaMaskExtension = getIsMetaMaskWallet()
    const hasOKXExtension = getIsOKXWallet()
    const hasCoinbaseExtension = getIsCoinbaseWallet()

    const isCoinbaseWalletBrowser = isMobile && hasCoinbaseExtension
    const isMetaMaskBrowser = isMobile && hasMetaMaskExtension
    const isInjectedMobileBrowser = isCoinbaseWalletBrowser || isMetaMaskBrowser

    let injectedOption
    if (!isInjected) {
      if (!isMobile) {
        injectedOption = <InstallMetaMaskOption />
      }
    } else if (!hasCoinbaseExtension) {
      if (hasMetaMaskExtension) {
        injectedOption = <MetaMaskOption tryActivation={tryActivation} />
      } else {
        injectedOption = <InjectedOption tryActivation={tryActivation} />
      }
    }

    let coinbaseWalletOption
    if (isMobile && !isInjectedMobileBrowser) {
      coinbaseWalletOption = <OpenCoinbaseWalletOption />
    } else if (!isMobile || isCoinbaseWalletBrowser) {
      coinbaseWalletOption = <CoinbaseWalletOption tryActivation={tryActivation} />
    }

    // const walletConnectionOption =
    //   (!isInjectedMobileBrowser && <WalletConnectOption tryActivation={tryActivation} />) ?? null

    const walletConnectionV2Option =
      (!isInjectedMobileBrowser && <WalletConnectV2Option tryActivation={tryActivation} />) ?? null

    const OkxWalletOption = hasOKXExtension ? <OKXOption tryActivation={tryActivation} /> : <InstallOKXOption />

    return (
      <>
        {injectedOption}
        {OkxWalletOption}
        {coinbaseWalletOption}
        {walletConnectionV2Option}
      </>
    )
  }

  function getModalContent() {
    if (walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <>
          <ModalHeader title={'Wallet'} onClose={toggleWalletModal} />
          <AccountDetails
            pendingTransactions={pendingTransactions}
            confirmedTransactions={confirmedTransactions}
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
            ENSName={ENSName}
          />
        </>
      )
    }

    let headerRow
    if (walletView === WALLET_VIEWS.PENDING || walletView === WALLET_VIEWS.ACCOUNT || !!account) {
      headerRow = (
        <HeaderRow color="blue">
          <HoverText onClick={() => setWalletView(account ? WALLET_VIEWS.ACCOUNT : WALLET_VIEWS.OPTIONS)}>
            <ArrowLeft />
          </HoverText>
        </HeaderRow>
      )
    } else {
      headerRow = (
        <HeaderRow>
          <HoverText>Connect a wallet</HoverText>
        </HeaderRow>
      )
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {headerRow}
        <ContentWrapper>
          <AutoColumn gap="16px">
            {walletView === WALLET_VIEWS.PENDING && pendingConnector && (
              <PendingView
                openOptions={openOptions}
                connector={pendingConnector}
                error={!!pendingError}
                tryActivation={tryActivation}
              />
            )}
            {walletView !== WALLET_VIEWS.PENDING && <OptionGrid>{getOptions()}</OptionGrid>}
          </AutoColumn>
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onBackgroundClick={toggleWalletModal} onEscapeKeydown={toggleWalletModal}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
