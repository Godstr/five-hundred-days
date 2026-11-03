import { useSyncExternalStore } from 'react'

/** A tiny observable store, enough for the few bits of state shared across the page. */
export function createStore<T extends object>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()

  const get = () => state
  const set = (patch: Partial<T> | ((current: T) => Partial<T>)) => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
    listeners.forEach((listener) => listener())
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  /** Select a slice. Return primitives or stable references only. */
  const use = <S>(selector: (current: T) => S): S => useSyncExternalStore(subscribe, () => selector(state))

  return { get, set, subscribe, use }
}

/** Page-level UI state. */
export const ui = createStore({
  /** The intro overlay has been dismissed. */
  entered: false,
  /** The hero (and its big record) is on screen; the mini player hides while it is. */
  heroVisible: true,
  /** The memory open in the track sheet. */
  sheetId: null as string | null,
  terminalOpen: false,
  letterOpen: false,
})
