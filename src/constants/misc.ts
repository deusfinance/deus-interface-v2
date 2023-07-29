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

export const myMigrationSignatureMessage = `Date: ${formatDate(new Date())}

In order to view a wallet's migrated amount across all chains, the wallet owner should sign the following message:

I, hereby declare that I am the rightful owner of this Ethereum wallet. I confirm that I am a human and not a bot. I am aiming to utilize this feature to access my migration data.

I understand the importance of conserving computational resources and ensuring the integrity of the API. I pledge not to abuse the API or bombard it with unnecessary requests.

By signing this message with my Ethereum wallet, I accept responsibility for all actions conducted through this wallet.

Ethereum Wallet Address: `

export const migrationTermOfServiceSignatureMessage = `Migration Terms of Service

By signing with your Ethereum wallet, you confirm your acceptance of the following terms and conditions related to this migration:

You comprehend that the migration of your DEUS, legacy DEI, bDEI, and xDEUS tokens is a process that requires time.
You acknowledge and agree that, once initiated, the migration process cannot be reversed.
You are aware that details regarding token distribution will be communicated in Q3, with the anticipated execution of distribution slated for Q4.
You willingly accept any potential delays that may occur during this process and agree not to hold the platform accountable for such delays.
You confirm that all the information provided by you during this process is accurate, complete, and current.
You confirm your acceptance of the general Terms of Service of DEUS, affirming that you have read, understood, and agree with them.
You commit to comply with all laws and regulations relevant to the use of this service.
Take a moment to carefully review these terms. By signing with your Ethereum wallet, you legally consent to be bound by these terms. If you are not in agreement with these terms, you should refrain from proceeding with the migration process.`
