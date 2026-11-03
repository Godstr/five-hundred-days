import { AnimatePresence, motion, useInView } from 'framer-motion'
import { KeyRound, Mail, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { story } from '../../config/story'
import { t as translate, useI18n } from '../../i18n'
import { burstFrom, toast } from '../../lib/fx'
import { EASE, reveal } from '../../lib/motion'
import { ui } from '../../lib/store'
import { SectionHeading } from '../ui/SectionHeading'
import { Envelope } from './Envelope'
import { Keypad } from './Keypad'
import { VaultDoor, type CodeStatus, type VaultPhase } from './VaultDoor'

const CODE = story.vault.code.replace(/\D/g, '') || '0000'
const STORAGE_KEY = 'five-hundred-days:vault-open'

function remembered(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function remember(open: boolean) {
  try {
    if (open) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* private mode: she'll just type it again */
  }
}

/** The hidden track: a safe that only opens with your date, holding a sealed letter. */
export function Vault() {
  const { t, tx } = useI18n()
  const [phase, setPhase] = useState<VaultPhase>(() => (remembered() ? 'open' : 'locked'))
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<CodeStatus>('idle')
  const [attempts, setAttempts] = useState(0)
  const [dial, setDial] = useState(0)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const doorRef = useRef<HTMLDivElement>(null)
  const keypadRef = useRef<HTMLDivElement>(null)
  const keypadInView = useInView(keypadRef, { amount: 0.4 })

  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const unlock = () => {
    setPhase('unlocking')
    remember(true)
    burstFrom(doorRef.current)
    toast(translate('vault.toast'))
    later(() => setPhase('open'), 1100)
  }

  // The latest entry lives in a ref too, so fast taps or typing never read a stale render
  const entry = useRef({ value: '', status: 'idle' as CodeStatus })
  const update = (value: string, next: CodeStatus = entry.current.status) => {
    entry.current = { value, status: next }
    setValue(value)
    setStatus(next)
  }

  const press = useCallback(
    (digit: string) => {
      const { value: current, status: currentStatus } = entry.current
      if (phase !== 'locked' || currentStatus !== 'idle' || current.length >= CODE.length) return
      const next = current + digit
      setDial((d) => d + (next.length % 2 ? 1 : -1) * (40 + Number(digit) * 36))
      if (next.length < CODE.length) {
        update(next)
      } else if (next === CODE) {
        update(next, 'success')
        later(unlock, 500)
      } else {
        update(next, 'error')
        setAttempts((a) => a + 1)
        later(() => update('', 'idle'), 750)
      }
    },
    // `later`, `unlock` and `update` only touch refs and state setters
    [phase],
  )

  const erase = useCallback(() => {
    if (entry.current.status === 'idle') update(entry.current.value.slice(0, -1))
  }, [])

  // A real keyboard works too, while the keypad is on screen and nothing covers it
  useEffect(() => {
    if (!keypadInView || phase !== 'locked') return
    const onKey = (event: KeyboardEvent) => {
      const { sheetId, terminalOpen, letterOpen } = ui.get()
      if (sheetId || terminalOpen || letterOpen || event.metaKey || event.ctrlKey || event.altKey) return
      if (/^\d$/.test(event.key)) press(event.key)
      else if (event.key === 'Backspace') erase()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keypadInView, phase, press, erase])

  const openLetter = (event?: { currentTarget: Element }) => {
    if (envelopeOpen) {
      ui.set({ letterOpen: true })
      return
    }
    setEnvelopeOpen(true)
    burstFrom(event?.currentTarget ?? doorRef.current)
    later(() => ui.set({ letterOpen: true }), 1000)
  }

  const lockAgain = () => {
    remember(false)
    setPhase('locked')
    update('', 'idle')
    setAttempts(0)
    setEnvelopeOpen(false)
  }

  return (
    <section id="vault" className="relative z-10 px-5 py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="05" kicker={t('vault.kicker')} title={t('vault.title')} accent={t('vault.accent')} />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
          <motion.div {...reveal}>
            <VaultDoor ref={doorRef} phase={phase} dial={dial} status={status}>
              <AnimatePresence>
                {phase === 'open' && (
                  <motion.div
                    className="relative w-[64%]"
                    initial={{ opacity: 0, scale: 0.7, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 110, damping: 15 }}
                  >
                    <Envelope opened={envelopeOpen} onOpen={() => openLetter()} />
                  </motion.div>
                )}
              </AnimatePresence>
            </VaultDoor>
          </motion.div>

          <div ref={keypadRef} className="text-center">
            <AnimatePresence mode="wait" initial={false}>
              {phase === 'locked' ? (
                <motion.div key="locked" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                  <p className="eyebrow">{t('vault.intro')}</p>
                  <p className="mt-3 text-xl text-cream">{t('vault.needsCode')}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-sand">
                    <KeyRound className="size-4 text-amber" /> {tx(story.vault.hint)}
                  </p>
                  <div className="mt-9">
                    <Keypad length={CODE.length} value={value} status={status} onDigit={press} onDelete={erase} />
                  </div>
                  <AnimatePresence>
                    {attempts >= 3 && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-7 font-hand text-[1.7rem] text-blush"
                      >
                        {tx(story.vault.rescueHint)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
                >
                  <p className="eyebrow text-emerald-300!">{t('vault.granted')}</p>
                  <p className="mt-4 font-display text-[clamp(2.8rem,10vw,4.2rem)] leading-none italic">{t('vault.found')}</p>
                  <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-sand">
                    {t('vault.inside')}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={(event) => openLetter(event)}
                      className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-ink"
                    >
                      <Mail className="size-4" /> {envelopeOpen ? t('vault.reread') : t('vault.open')}
                    </motion.button>
                    <button
                      type="button"
                      onClick={lockAgain}
                      className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-sand"
                    >
                      <RotateCcw className="size-4" /> {t('vault.lock')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
