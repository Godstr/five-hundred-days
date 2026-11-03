import { createStore } from './store'

/* Fire-and-forget effects: toasts and heart bursts. Rendered by <Toaster/> and <HeartBursts/>. */

let seq = 0

export const toasts = createStore({ items: [] as { id: number; text: string }[] })

export function toast(text: string, ms = 3200) {
  const id = ++seq
  toasts.set((s) => ({ items: [...s.items, { id, text }] }))
  window.setTimeout(() => toasts.set((s) => ({ items: s.items.filter((t) => t.id !== id) })), ms)
}

export const bursts = createStore({ items: [] as { id: number; x: number; y: number }[] })

/** A burst of hearts at viewport coordinates. */
export function burst(x: number, y: number) {
  const id = ++seq
  bursts.set((s) => ({ items: [...s.items, { id, x, y }] }))
  window.setTimeout(() => bursts.set((s) => ({ items: s.items.filter((b) => b.id !== id) })), 1800)
}

export function burstFrom(element: Element | null) {
  if (!element) return
  const rect = element.getBoundingClientRect()
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2)
}
