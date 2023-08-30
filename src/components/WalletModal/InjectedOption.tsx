import { Connector } from '@web3-react/types'
import INJECTED_ICON_URL from '/public/static/images/wallets/injected.svg'
import METAMASK_ICON_URL from '/public/static/images/wallets/metamask.png'
import OKX_ICON_URL from '/public/static/images/wallets/okx.png'
import { ConnectionType, injectedConnection, okxConnection } from 'connection'
import { getConnectionName } from 'connection/utils'

import Option from './Option'

const INJECTED_PROPS = {
  color: '#010101',
  icon: INJECTED_ICON_URL,
  id: 'injected',
}

const METAMASK_PROPS = {
  color: '#E8831D',
  icon: METAMASK_ICON_URL,
  id: 'metamask',
}

const OKX_PROPS = {
  color: '#010101',
  icon: OKX_ICON_URL,
  id: 'okx',
}

export function InstallMetaMaskOption() {
  return <Option {...METAMASK_PROPS} header={<div>Install MetaMask</div>} link="https://metamask.io/" />
}

export function InstallOKXOption() {
  return <Option {...OKX_PROPS} header={<div>Install OKX Wallet</div>} link="https://www.okx.com/web3" />
}

export function MetaMaskOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = injectedConnection.hooks.useIsActive()
  return (
    <Option
      {...METAMASK_PROPS}
      active={isActive}
      header={getConnectionName(ConnectionType.INJECTED, true)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}

export function OKXOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = injectedConnection.hooks.useIsActive()
  return (
    <Option
      {...OKX_PROPS}
      active={isActive}
      header={getConnectionName(ConnectionType.OKX, true)}
      onClick={() => tryActivation(okxConnection.connector)}
    />
  )
}

export function InjectedOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = injectedConnection.hooks.useIsActive()
  return (
    <Option
      {...INJECTED_PROPS}
      active={isActive}
      header={getConnectionName(ConnectionType.INJECTED, false)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}
