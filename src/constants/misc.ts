import { RetryOptions } from 'utils/retry'
import { formatDate } from 'utils/time'

export const NETWORK_CONTEXT_NAME = 'NETWORK'

// Only applies to L2
export const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}
export const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

// Only applies to L2
export const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {}

export const INFO_URL = 'https://info.deus.finance'

//oracle api
export const ORACLE_BASE_URL = new URL('https://oracle4.deus.finance')

export const signatureMessage = `Date: ${formatDate(new Date())}

In order to view a wallet's migrated amount across all chains, the wallet owner should sign the following message:

I, hereby declare that I am the rightful owner of this Ethereum wallet. I confirm that I am a human and not a bot. I am aiming to utilize this feature to access my migration data.

I understand the importance of conserving computational resources and ensuring the integrity of the API. I pledge not to abuse the API or bombard it with unnecessary requests.

By signing this message with my Ethereum wallet, I accept responsibility for all actions conducted through this wallet.

Ethereum Wallet Address: `
