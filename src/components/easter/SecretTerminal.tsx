import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { story } from '../../config/story'
import { t, tx, useI18n } from '../../i18n'
import { cn, useEscape, useScrollLock } from '../../lib/dom'
import { commitLog } from '../../lib/easterEggs'
import { ui } from '../../lib/store'
import { together } from '../../lib/time'

type Kind = 'cmd' | 'out' | 'note' | 'sign' | 'ok'
interface Line {
  kind: Kind
  text: string
}

function script(): Line[] {
  const { days } = together(new Date())
  return [
    { kind: 'cmd', text: 'cd ~/us && git log --oneline --reverse' },
    ...commitLog().map((text): Line => ({ kind: 'out', text })),
    { kind: 'cmd', text: 'cat love-note.txt' },
    ...tx(story.secret.note).map((text): Line => ({ kind: 'note', text })),
    { kind: 'sign', text: `— ${tx(story.secret.signature)}` },
    { kind: 'cmd', text: 'sudo love --forever' },
    { kind: 'out', text: '[sudo] password for you: ••••••••' },
    { kind: 'ok', text: t('terminal.ok', { n: days }) },
  ]
}

const STYLE: Record<Kind, string> = {
  cmd: 'text-cream',
  out: 'text-dust',
  note: 'text-blush',
  sign: 'text-rose font-semibold',
  ok: 'text-emerald-300',
}

/** The developer Easter egg: a terminal that types out a love note. Ctrl + Shift + L, love() or five taps on the logo. */
export function SecretTerminal() {
  const open = ui.use((s) => s.terminalOpen)
  const { lang, t: tr } = useI18n()
  const close = useCallback(() => ui.set({ terminalOpen: false }), [])
  useEscape(open, close)
  useScrollLock(open)

  const lines = useMemo(() => (open ? script() : []), [open, lang])
  const [step, setStep] = useState(0)
  const [chars, setChars] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) return
    setStep(0)
    setChars(0)
  }, [open])

  // The typewriter: commands are typed by hand, output arrives in quick bursts
  useEffect(() => {
    if (!open || step >= lines.length) return
    const line = lines[step]
    const isCommand = line.kind === 'cmd'
    const timer =
      chars < line.text.length
        ? window.setTimeout(() => setChars((c) => c + (isCommand ? 1 : 3)), isCommand ? 42 + Math.random() * 40 : 12)
        : window.setTimeout(() => {
            setStep((s) => s + 1)
            setChars(0)
          }, isCommand ? 420 : line.text ? 110 : 60)
    return () => window.clearTimeout(timer)
  }, [open, step, chars, lines])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [step, chars])

  const done = step >= lines.length
  const skip = () => {
    setStep(lines.length)
    setChars(0)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={tr('terminal.label')}
            onClick={(event) => {
              event.stopPropagation()
              skip()
            }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b0c]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)]"
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <button
                type="button"
                aria-label={tr('close')}
                onClick={(event) => {
                  event.stopPropagation()
                  close()
                }}
                className="size-3 rounded-full bg-[#ff5f57]"
              />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 truncate font-mono text-[11px] text-dust">you@her-heart: ~/us — zsh</span>
            </div>

            <div
              ref={scroller}
              className="max-h-[68dvh] overflow-y-auto p-4 font-mono text-[12px] leading-relaxed md:p-6 md:text-[13px]"
            >
              {lines.slice(0, Math.min(step + 1, lines.length)).map((line, i) => {
                const text = i < step ? line.text : line.text.slice(0, chars)
                return (
                  <p key={i} className={cn('break-words whitespace-pre-wrap', STYLE[line.kind], line.kind === 'cmd' && i > 0 && 'mt-4')}>
                    {line.kind === 'cmd' && <span className="text-rose">❯ </span>}
                    {text || ' '}
                    {i === step && !done && <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-blink bg-cream" />}
                  </p>
                )
              })}
              {done && (
                <p className="mt-4 text-cream">
                  <span className="text-rose">❯ </span>
                  <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-blink bg-cream" />
                </p>
              )}
            </div>

            <div className="border-t border-white/8 px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-dust">
              {done ? tr('terminal.done') : tr('terminal.skip')}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
