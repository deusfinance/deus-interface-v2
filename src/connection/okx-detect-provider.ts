// interface OkxWalletProvider {
//   isOkxWallet?: boolean
//   once(eventName: string | symbol, listener: (...args: any[]) => void): this
//   on(eventName: string | symbol, listener: (...args: any[]) => void): this
//   off(eventName: string | symbol, listener: (...args: any[]) => void): this
//   addListener(eventName: string | symbol, listener: (...args: any[]) => void): this
//   removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this
//   removeAllListeners(event?: string | symbol): this
// }

// interface Window {
//   okxwallet?: OkxWalletProvider
// }

// /**
//  * Returns a Promise that resolves to the value of window.ethereum if it is
//  * set within the given timeout, or null.
//  * The Promise will not reject, but an error will be thrown if invalid options
//  * are provided.
//  *
//  * @param options - Options bag.
//  * @param options.mustBeOKX - Whether to only look for MetaMask providers.
//  * Default: false
//  * @param options.silent - Whether to silence console errors. Does not affect
//  * thrown errors. Default: false
//  * @param options.timeout - Milliseconds to wait for 'ethereum#initialized' to
//  * be dispatched. Default: 3000
//  * @returns A Promise that resolves with the Provider if it is detected within
//  * given timeout, otherwise null.
//  */
// export default function detectOkxWalletProvider<T = OkxWalletProvider>({
//   mustBeOKX = false,
//   silent = false,
//   timeout = 3000,
// } = {}): Promise<T | null> {
//   _validateInputs()

//   let handled = false

//   return new Promise((resolve) => {
//     if ((window as Window).okxwallet) {
//       handleOkxwallet()
//     } else {
//       window.addEventListener('okxwallet#initialized', handleOkxwallet, { once: true })

//       setTimeout(() => {
//         handleOkxwallet()
//       }, timeout)
//     }

//     function handleOkxwallet() {
//       if (handled) {
//         return
//       }
//       handled = true

//       window.removeEventListener('okxwallet#initialized', handleOkxwallet)

//       const { okxwallet } = window as Window

//       if (okxwallet && (!mustBeOKX || okxwallet.isOkxWallet)) {
//         resolve(okxwallet as unknown as T)
//       } else {
//         const message =
//           mustBeOKX && okxwallet ? 'Non-MetaMask window.okxwallet detected.' : 'Unable to detect window.okxwallet.'

//         !silent && console.error('okx-detect-provider:', message)
//         resolve(null)
//       }
//     }
//   })

//   function _validateInputs() {
//     if (typeof mustBeOKX !== 'boolean') {
//       throw new Error(`okx-detect-provider: Expected option 'mustBeOKX' to be a boolean.`)
//     }
//     if (typeof silent !== 'boolean') {
//       throw new Error(`okx-detect-provider: Expected option 'silent' to be a boolean.`)
//     }
//     if (typeof timeout !== 'number') {
//       throw new Error(`okx-detect-provider: Expected option 'timeout' to be a number.`)
//     }
//   }
// }
