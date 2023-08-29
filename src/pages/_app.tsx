import { Provider as ReduxProvider } from 'react-redux'
import { ModalProvider } from 'styled-react-modal'
import dynamic from 'next/dynamic'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import ThemeProvider, { ThemedGlobalStyle } from '../theme'
import Popups from '../components/Popups'
import Layout from '../components/Layout'
import { ModalBackground } from '../components/Modal'
// import { useAnalyticsReporter } from '../components/analytics'
import LiveChat from 'components/LiveChat'

import store from '../state'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
// import { getLibrary } from '../utils/library'

const Updaters = dynamic(() => import('../state/updaters'), { ssr: false })
const Web3Provider = dynamic(() => import('../components/Web3Provider'), {
  ssr: false,
})

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

export default function MyApp({ Component, pageProps }: AppProps) {
  // TODO: is it ok to remove it?
  // useAnalyticsReporter()
  return (
    <ReduxProvider store={store}>
      <Web3Provider>
        <ThemeProvider>
          <ThemedGlobalStyle />
          <ModalProvider backgroundComponent={ModalBackground}>
            <Toaster position="bottom-center" />
            <BlockNumberProvider>
              <LiveChat />
              <Popups />
              <Updaters />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </BlockNumberProvider>
          </ModalProvider>
        </ThemeProvider>
      </Web3Provider>
    </ReduxProvider>
  )
}
