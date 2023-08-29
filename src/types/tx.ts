export enum TX_STATE {
  WAITING = 'WAITING',
  CONFIRM = 'CONFIRMING',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type TxInfo = {
  callback: (() => Promise<string | void>) | null
  summary: string | null
  pauser?: boolean
}
