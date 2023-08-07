import { RetryOptions } from 'utils/retry'

export const NETWORK_CONTEXT_NAME = 'NETWORK'

// Only applies to L2
export const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}
export const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

// Only applies to L2
export const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {}

export const INFO_URL = 'https://info.deus.finance'

//oracle api
export const ORACLE_BASE_URL = new URL('https://oracle4.deus.finance')

export const migrationTermOfServiceSignatureMessage = `Please take a moment to carefully review the following information and terms. By signing, you legally consent to be bound by these terms. If you are not in agreement, you should refrain from proceeding with the migration process.

_

I declare that I am the rightful owner of this Ethereum wallet. I confirm that I am a human and not a bot. I am aiming to utilize this feature to access my migration data.

I understand the importance of conserving computational resources and ensuring the integrity of the API. I pledge not to abuse the API or bombard it with unnecessary requests.

By signing this message with my Ethereum wallet, I accept responsibility for all actions conducted through this wallet.

Additionally, by signing, I confirm my acceptance of the following terms and conditions related to this migration:

Once initiated, the migration process cannot be reversed.

The migration of DEUS, legacy DEI, bDEI, and xDEUS tokens is not instant and can incur delays. The details regarding token distribution will be communicated in Q3 2023, with the anticipated execution of distribution expected for Q4.
I accept any potential delays that may occur during this process and agree not to hold the platform accountable for such delays.

I confirm that all the information provided during this process is accurate, complete, and current.
I also confirm to accept the general Terms of Service of DEUS (https://docs.deus.finance/contracts/legals-and-disclaimer/terms-of-service) confirming that I have read and understood them.

I commit to comply with all laws and regulations relevant to the use of this service.`
