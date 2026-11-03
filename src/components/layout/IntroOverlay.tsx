import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Headphones, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { engine, SIDE_A_ID } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useScrollLock } from '../../lib/dom'
import { EASE } from '../../lib/motion'
import { ui } from '../../lib/store'
import { together } from '../../lib/time'
import { LanguageSwitch } from '../ui/LanguageSwitch'

/**
 * The opening: a counter racing up to today's day count while "the needle is
 * placed". The tap that dismisses it is also the tap iOS needs before it lets
 * a page play sound.
 */
export function IntroOverlay() {
  const entered = ui.use((s) => s.entered)
  const { t, tx } = useI18n()
  const reduced = useReducedMotion()
  const [days] = useState(() => together(new Date()).days)
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)
  useScrollLock(!entered)

  useEffect(() => {
    engine.prefetch(SIDE_A_ID)
    const controls = animate(0, days, {
      duration: reduced ? 0 : 2.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setReady(true),
    })
    return () => controls.stop()
  }, [days, reduced])

  const enter = (withSound: boolean) => {
    if (withSound) engine.play(SIDE_A_ID)
    ui.set({ entered: true })
  }

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink px-6"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgb(255_111_145/0.12),transparent)]" />
          <LanguageSwitch className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4" />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative text-sm font-semibold tracking-[0.32em]"
          >
            500 <span className="text-amber">DAYS</span>
          </motion.p>

          <p className="relative mt-3 font-display text-[clamp(7rem,34vw,13rem)] leading-none font-light tabular-nums">{count}</p>

          <div className="relative h-px w-[min(72vw,340px)] overflow-hidden bg-white/12">
            <div
              className="absolute inset-y-0 left-0 bg-cream transition-[width] duration-100"
              style={{ width: `${days ? (count / days) * 100 : 100}%` }}
            />
          </div>
          <p className="relative mt-4 font-mono text-[11px] tracking-[0.18em] text-dust">
            {ready ? t('intro.for', { to: tx(story.her.nameTo) }) : t('intro.needle')}
          </p>

          <div className="relative mt-12 flex h-40 flex-col items-center">
            <AnimatePresence>
              {ready && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => enter(true)}
                    className="group relative inline-flex items-center gap-3 rounded-full bg-cream py-3.5 pr-7 pl-3.5 text-[15px] font-semibold text-ink shadow-[0_18px_50px_-14px_rgba(255,111,145,0.8)]"
                  >
                    <span className="absolute inset-0 animate-pulse-ring rounded-full border border-cream/40" />
                    <span className="grid size-9 place-items-center rounded-full bg-ink text-cream">
                      <Play className="size-4 translate-x-px fill-current" />
                    </span>
                    {t('intro.play')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => enter(false)}
                    className="font-mono text-[11px] tracking-[0.14em] text-dust underline decoration-dust/40 underline-offset-4 hover:text-sand"
                  >
                    {t('intro.quiet')}
                  </button>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-dust">
                    <Headphones className="size-3.5" /> {t('intro.headphones')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
