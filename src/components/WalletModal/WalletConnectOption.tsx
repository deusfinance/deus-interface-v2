import { Connector } from '@web3-react/types'
import WALLET_CONNECT_ICON_URL from '/public/static/images/wallets/walletConnect.png'
import { ConnectionType, walletConnectConnectionV1, walletConnectConnectionV2 } from 'connection'
import { getConnectionName } from 'connection/utils'

import Option from './Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: WALLET_CONNECT_ICON_URL,
  id: 'wallet-connect',
}
const BASE_PROPS_V2 = {
  color: '#4196FC',
  icon: WALLET_CONNECT_ICON_URL,
  id: 'wallet-connect-v2',
}

export function WalletConnectOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = walletConnectConnectionV1.hooks.useIsActive()
  return (
    <Option
      {...BASE_PROPS}
      active={isActive}
      onClick={() => tryActivation(walletConnectConnectionV1.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}

export function WalletConnectV2Option({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = walletConnectConnectionV2.hooks.useIsActive()
  return (
    <Option
      {...BASE_PROPS_V2}
      active={isActive}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
