import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

BigNumber.config({ EXPONENTIAL_AT: 30 })

export function toBN(number: BigNumber.Value): BigNumber {
  return new BigNumber(number)
}

export const BN_ZERO: BigNumber = toBN('0')
export const BN_ONE: BigNumber = toBN('1')
export const BN_TEN: BigNumber = toBN('10')

export const BIG_INT_ZERO = JSBI.BigInt(0)

export enum RoundMode {
  ROUND_UP,
  ROUND_DOWN,
}

export function removeTrailingZeros(number: BigNumber.Value): string {
  return toBN(number).toString()
}

export function formatFixedAmount(amount: BigNumber.Value | undefined | null, fixed = 2, separator = true): string {
  if (amount === null || amount === undefined) return ''

  const toFixed = toBN(amount).toFixed(fixed, RoundMode.ROUND_DOWN)
  return separator ? toBN(toFixed).toFormat() : removeTrailingZeros(toFixed)
}

export function formatFixedDollarAmount(
  amount: BigNumber.Value | undefined | null,
  fixed = 2,
  separator = true
): string {
  if (amount === null || amount === undefined) return ''

  const bnAmount = toBN(amount)
  if (bnAmount.isZero()) {
    return '$0'
  }

  if (bnAmount.lt(0.001)) {
    return '< $0.001'
  }

  return '$' + formatFixedAmount(amount, fixed, separator)
}

export const formatAmount = (
  amount: BigNumber.Value | undefined | null,
  fixed = 6,
  separator = false,
  zeroEmpty = false
): string => {
  if (amount === null || amount === undefined) return ''

  const bnAmount = toBN(amount)
  if (bnAmount.isZero() && zeroEmpty) {
    return ''
  }

  if (BN_TEN.pow(fixed - 1).lte(bnAmount)) {
    return separator ? toBN(amount).toFormat(0, BigNumber.ROUND_DOWN) : bnAmount.toFixed(0, BigNumber.ROUND_DOWN)
  }

  const rounded = bnAmount.sd(fixed, BigNumber.ROUND_DOWN)
  return separator ? toBN(rounded.toFixed()).toFormat() : rounded.toFixed()
}

export const formatCurrency = (
  amount: BigNumber.Value | undefined | null,
  fixed = 6,
  separator = false,
  zeroEmpty = false
) => {
  if (amount === undefined || amount === null || amount === '') return '-'
  const bnAmount = toBN(amount)
  if (bnAmount.isZero()) {
    return zeroEmpty ? '' : '0'
  }
  if (bnAmount.lt(0.001)) {
    return '< 0.001'
  }
  if (bnAmount.gte(1e9)) {
    return formatAmount(bnAmount.div(1e9), fixed, separator, zeroEmpty) + 'B'
  }
  if (bnAmount.gte(1e6)) {
    return formatAmount(bnAmount.div(1e6), fixed, separator, zeroEmpty) + 'M'
  }
  if (bnAmount.gte(1e3)) {
    return formatAmount(bnAmount.div(1e3), fixed, separator, zeroEmpty) + 'K'
  }
  return formatAmount(bnAmount, fixed, separator, zeroEmpty)
}

export const formatDollarAmount = (amount: BigNumber.Value | undefined | null, zeroEmpty = false) => {
  const fixed = amount && toBN(amount).gt(1000) ? 4 : 3
  const formattedAmount = formatCurrency(amount, fixed, true, zeroEmpty)

  if (formattedAmount === '' || formattedAmount === 'NaN') return ''

  if (formattedAmount === '< 0.001') {
    return '< $0.001'
  }
  return formattedAmount !== '-' ? `$${formattedAmount}` : '-'
}

//TODO: toFixed is using round mode
export function toWei(amount: BigNumber.Value | null, decimals = 18): string {
  return toWeiBN(amount, decimals).toFixed(0)
}

export function toWeiBN(amount: BigNumber.Value | null, decimals = 18): BigNumber {
  if (amount === undefined || amount === null || amount === '') return BN_ZERO
  if (typeof amount === 'string' && isNaN(Number(amount))) {
    return BN_ZERO
  }
  return toBN(amount).times(BN_TEN.pow(decimals))
}

export function fromWei(amount: BigNumber.Value | null, decimals = 18, defaultOutput?: string): string {
  if (amount === undefined || amount === null || amount === '') return '0'
  if (typeof amount === 'string' && isNaN(Number(amount))) {
    return defaultOutput ?? '0'
  }

  return toBN(amount).div(BN_TEN.pow(decimals)).toString()
}

export function formatPrice(number: BigNumber.Value, pricePrecision = 2, separator = true): string {
  const toFixed = toBN(number).toFixed(pricePrecision, RoundMode.ROUND_DOWN)
  return separator ? toBN(toFixed).toFormat() : removeTrailingZeros(toFixed)
}

export const formatBalance = (balance: BigNumber.Value | undefined | null, fixed = 6): string => {
  if (balance === null || balance === undefined) return ''

  const bnBalance = toBN(balance)
  if (
    toBN(10)
      .pow(fixed - 1)
      .lte(bnBalance)
  ) {
    return bnBalance.toFixed(0, BigNumber.ROUND_DOWN)
  }
  return bnBalance.sd(fixed, BigNumber.ROUND_DOWN).toFixed()
}

export function formatNumber(n?: number | string): string {
  if (n === undefined || n === null || n === '' || n === 'N/A') return 'N/A'
  const numberValue = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(numberValue)) throw new Error(`Invalid number: ${n}`)
  if (numberValue !== 0 && Math.abs(numberValue) < 1) return n.toString()
  return numberValue.toLocaleString('en-US')
}
