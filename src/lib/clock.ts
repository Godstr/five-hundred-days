import { useSyncExternalStore } from 'react'
import { together } from './time'

/* One shared clock that ticks exactly on the second, so every counter on the page flips together. */

let now = new Date()
let timer: number | undefined
const listeners = new Set<() => void>()

function tick() {
  now = new Date()
  listeners.forEach((listener) => listener())
}

function schedule() {
  timer = window.setTimeout(() => {
    tick()
    schedule()
  }, 1000 - (Date.now() % 1000) + 5)
}

function onVisibility() {
  if (document.visibilityState === 'visible') tick()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    now = new Date()
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }
}

export function useNow(): Date {
  return useSyncExternalStore(subscribe, () => now)
}

export function useTogether() {
  return together(useNow())
}
