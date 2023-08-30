import { UAParser } from 'ua-parser-js'

const parser = new UAParser(typeof window !== 'undefined' ? window.navigator.userAgent : undefined)
const { type } = parser.getDevice()

export const isMobile = type === 'mobile' || type === 'tablet'
