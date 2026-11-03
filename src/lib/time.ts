import { story } from '../config/story'
import { i18n, LOCALES } from '../i18n'

const DAY_MS = 86_400_000

/** Parses 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm' as local time (`new Date('2025-06-21')` would be UTC). */
export function parseLocal(value: string): Date {
  const [date, time = '00:00'] = value.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh = 0, mm = 0, ss = 0] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, ss)
}

export const START = parseLocal(story.startDate)

/** Whole calendar days from one date to another, immune to daylight-saving shifts. */
export function calendarDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / DAY_MS)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export interface Together {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

/** Time since the start date, split the way the counter shows it. */
export function together(now: Date, start = START): Together {
  if (now <= start) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
  let days = calendarDays(start, now)
  let anchor = addDays(start, days)
  if (anchor > now) anchor = addDays(start, --days)
  const rest = now.getTime() - anchor.getTime()
  return {
    days,
    hours: Math.min(23, Math.floor(rest / 3_600_000)),
    minutes: Math.floor(rest / 60_000) % 60,
    seconds: Math.floor(rest / 1000) % 60,
    totalSeconds: Math.floor((now.getTime() - start.getTime()) / 1000),
  }
}

/** The "Day N" stamp of a memory. The first day is Day 0, because arrays start at zero. */
export function dayOf(date: string): number {
  return calendarDays(START, parseLocal(date))
}

const MILESTONES = [100, 200, 300, 365, 400, 500, 600, 700, 730, 800, 900, 1000]

export function isMilestone(days: number): boolean {
  return MILESTONES.includes(days) || (days > 0 && days % 500 === 0)
}

export function nextMilestone(days: number): { day: number; date: Date; inDays: number } {
  const day = MILESTONES.find((m) => m > days) ?? (Math.floor(days / 500) + 1) * 500
  return { day, date: addDays(START, day), inDays: day - days }
}

const DATE_STYLES = {
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  weekday: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

const formatters = new Map<string, Intl.DateTimeFormat>()

const MN_WEEKDAYS = ['ням', 'даваа', 'мягмар', 'лхагва', 'пүрэв', 'баасан', 'бямба']

/** Mongolian by hand: many browsers ship without Mongolian date data and fall back to English. */
function formatMongolian(d: Date, style: keyof typeof DATE_STYLES): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (style === 'short') return `${y}.${pad2(m)}.${pad2(d.getDate())}`
  const long = `${y} оны ${m}-р сарын ${d.getDate()}`
  return style === 'weekday' ? `${long}, ${MN_WEEKDAYS[d.getDay()]} гараг` : long
}

/** Formats in the current site language. */
export function formatDate(date: Date | string, style: keyof typeof DATE_STYLES = 'long'): string {
  const lang = i18n.get().lang
  if (lang === 'mn') return formatMongolian(typeof date === 'string' ? parseLocal(date) : date, style)
  const locale = LOCALES[lang]
  const key = `${locale}:${style}`
  let formatter = formatters.get(key)
  if (!formatter) formatters.set(key, (formatter = new Intl.DateTimeFormat(locale, DATE_STYLES[style])))
  return formatter.format(typeof date === 'string' ? parseLocal(date) : date)
}

export const formatNumber = (n: number) => new Intl.NumberFormat(LOCALES[i18n.get().lang]).format(n)

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** 83.4 → "1:23" */
export function formatClock(seconds: number): string {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** 8 → "eight" (falls back to digits past twelve). */
export const spellNumber = (n: number) => WORDS[n] ?? String(n)
