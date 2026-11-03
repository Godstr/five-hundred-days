import { useEffect, useSyncExternalStore } from 'react'

/** Resolves a path inside /public against the deployed base URL. Absolute URLs pass through. */
export function asset(path?: string): string | undefined {
  if (!path) return undefined
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(?:data|blob):/i.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\.?\//, '')
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/* Scroll lock that also holds on iOS Safari, where `overflow: hidden` on <body> is ignored.
   Reference-counted so stacked overlays (intro → sheet → letter) unlock in the right order. */
let locks = 0
let savedY = 0

function lockScroll() {
  if (locks++ > 0) return
  savedY = window.scrollY
  Object.assign(document.body.style, { position: 'fixed', top: `-${savedY}px`, left: '0', right: '0', width: '100%' })
}

function unlockScroll() {
  if (--locks > 0) return
  locks = 0
  Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '' })
  window.scrollTo({ top: savedY, behavior: 'instant' })
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockScroll()
    return unlockScroll
  }, [active])
}

/** Closes overlays on Escape. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onEscape])
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
