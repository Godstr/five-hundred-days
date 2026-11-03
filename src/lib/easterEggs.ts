import { story } from '../config/story'
import { t, tx } from '../i18n'
import { burst, toast } from './fx'
import { ui } from './store'
import { dayOf, together } from './time'

/* For the girl who opens the inspector. */

const VINYL = String.raw`
        .-"""""""-.
      .'  _.---._  '.
     /  .'       '.  \
    |  /   .---.   \  |
    |  |  ( 500 )  |  |
    |  \   '---'   /  |
     \  '._     _.'  /
      '.  '-----'  .'
        '-._____.-'`

const HEART = String.raw`
   .:::.   .:::.
  :::::::.:::::::
  :::::::::::::::
  ':::::::::::::'
    ':::::::::'
      ':::::'
        ':'`

const css = {
  title: 'font: italic 600 44px "Cormorant Garamond Variable", Georgia, serif; color: #ff6f91; text-shadow: 0 0 18px rgba(255,111,145,.45); padding: 4px 0;',
  art: 'font: 12px/1.15 "JetBrains Mono Variable", ui-monospace, monospace; color: #f2a457;',
  heart: 'font: 13px/1.1 "JetBrains Mono Variable", ui-monospace, monospace; color: #ff6f91;',
  body: 'font: 14px/1.7 "Inter Variable", system-ui, sans-serif; color: #f3eadb; background: #171412; padding: 14px 18px; border-left: 3px solid #ff6f91; border-radius: 8px;',
  signature: 'font: 600 13px "JetBrains Mono Variable", ui-monospace, monospace; color: #ff6f91;',
  hint: 'font: 12px "JetBrains Mono Variable", ui-monospace, monospace; color: #8a7f72;',
}

/** A short, stable, git-looking hash. */
function shortHash(text: string): string {
  let h = 2166136261
  for (const ch of text) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

/** The relationship as a commit history: one commit per track. */
export function commitLog(): string[] {
  const last = story.tracks.length - 1
  return story.tracks.map((track, i) => {
    const title = tx(track.title).toLowerCase()
    const day = `day ${dayOf(track.date)}`
    return `${shortHash(track.id)} ${i === last ? '(HEAD -> forever) ' : ''}${title}${title.includes(day) ? '' : ` · ${day}`}`
  })
}

export function printLoveNote() {
  const { days } = together(new Date())
  console.log(`%c${t('console.title', { n: days })}`, css.title)
  console.log(`%c${VINYL}`, css.art)
  console.log(`%c${tx(story.secret.note).join('\n')}`, css.body)
  console.log(`%c— ${tx(story.secret.signature)} ♡`, css.signature)
  console.log(`%c${t('console.hint')}`, css.hint)
}

function love(): string {
  console.log(`%c${HEART}`, css.heart)
  console.log(`%c${commitLog().join('\n')}`, css.hint)
  ui.set({ terminalOpen: true })
  burst(window.innerWidth / 2, window.innerHeight / 2)
  return t('console.love', { n: together(new Date()).days })
}

declare global {
  interface Window {
    love?: () => string
  }
}

let installed = false

/** Console note on load, `love()` in the console, Ctrl + Shift + L, and a wink when the inspector shortcut is pressed. */
export function installEasterEggs() {
  if (installed) return
  installed = true
  printLoveNote()
  window.love = love

  window.addEventListener('keydown', (event) => {
    const modifier = event.ctrlKey || event.metaKey
    if (modifier && event.shiftKey && event.code === 'KeyL') {
      event.preventDefault()
      printLoveNote()
      ui.set({ terminalOpen: true })
      return
    }
    const inspector =
      event.key === 'F12' || (modifier && (event.shiftKey || event.altKey) && ['KeyI', 'KeyJ', 'KeyC'].includes(event.code))
    if (inspector) {
      printLoveNote()
      toast(t('console.toast'))
    }
  })
}
