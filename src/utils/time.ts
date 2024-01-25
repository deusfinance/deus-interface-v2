import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export enum RoundMode {
  ROUND_DOWN,
  ROUND_UP,
}

export function getDurationSeconds(targetDate: Date, ROUND_MODE: RoundMode): number {
  const now = dayjs.utc().unix()
  const then = dayjs.utc(targetDate).unix()
  const result = then - now
  return ROUND_MODE === RoundMode.ROUND_DOWN ? Math.floor(result) : Math.ceil(result)
}

export function formatDate(date: Date) {
  const days = [
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th',
    '11th',
    '12th',
    '13th',
    '14th',
    '15th',
    '16th',
    '17th',
    '18th',
    '19th',
    '20th',
    '21st',
    '22nd',
    '23rd',
    '24th',
    '25th',
    '26th',
    '27th',
    '28th',
    '29th',
    '30th',
    '31st',
  ]
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return days[date.getDate() - 1] + ' ' + months[date.getMonth()] + ', ' + date.getFullYear()
}

export function getRemainingTime(timeStamp: number): {
  diff: number
  day: number
  hours: number
  minutes: number
  seconds: number
} {
  if (timeStamp === 0) return { diff: 0, day: 0, hours: 0, minutes: 0, seconds: 0 }
  const now = dayjs().utc()
  const endTime = dayjs.utc(timeStamp * 1e3)
  const diff = endTime.diff(now)

  if (diff <= 0) return { diff: 0, day: 0, hours: 0, minutes: 0, seconds: 0 }

  const day = endTime.diff(now, 'day')
  const hours = dayjs.utc(diff).hour()
  const minutes = dayjs.utc(diff).minute()
  const seconds = dayjs.utc(diff).second()

  return { diff, day, hours, minutes, seconds }
}

export function getTimeLength(timeLength: number): {
  hours: string
  minutes: string
  seconds: string
  fullLength: string
} {
  const hours = dayjs.utc(timeLength).hour() + ' hr'
  const minutes = dayjs.utc(timeLength).minute() + ' min'
  const seconds = dayjs.utc(timeLength).second() + ' sec'

  let fullLength = ''
  if (hours[0] !== '0') fullLength += hours
  if (minutes[0] !== '0') fullLength += minutes
  if (seconds[0] !== '0') fullLength += seconds

  return { hours, minutes, seconds, fullLength }
}

export function getTimeLengthExtended(timeLength: number): {
  hours: string
  minutes: string
  seconds: string
  fullLength: string
} {
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(timeLength / 3600000) // 1 hour = 3600000 milliseconds
  const minutes = Math.floor((timeLength % 3600000) / 60000) // 1 minute = 60000 milliseconds
  const seconds = Math.floor((timeLength % 60000) / 1000) // 1 second = 1000 milliseconds

  // Format the output
  const formattedHours = hours > 0 ? hours + ' hours, ' : ''
  const formattedMinutes = minutes > 0 ? minutes + ' minutes, ' : ''
  const formattedSeconds = seconds > 0 ? seconds + ' seconds' : ''

  // Concatenate the non-zero durations
  let fullLength = formattedHours + formattedMinutes + formattedSeconds
  fullLength = fullLength.endsWith(', ') ? fullLength.slice(0, -2) : fullLength // Remove trailing comma if exists

  return {
    hours: hours + ' hr',
    minutes: minutes + ' min',
    seconds: seconds + ' sec',
    fullLength,
  }
}
