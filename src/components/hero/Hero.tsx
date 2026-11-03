import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Pause, Play } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { engine, useIsPlaying } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useMediaQuery, scrollToId } from '../../lib/dom'
import { burstFrom } from '../../lib/fx'
import { EASE } from '../../lib/motion'
import { ui } from '../../lib/store'
import { formatDate, isMilestone, START, together } from '../../lib/time'
import { Counter } from './Counter'
import { Turntable } from './Turntable'

const stagger = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const rise = {
  hidden: { opacity: 0, y: 30 },
  shown: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } },
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const entered = ui.use((s) => s.entered)
  const playing = useIsPlaying()
  const { t, tx } = useI18n()
  const desktop = useMediaQuery('(min-width: 1024px)')
  const inView = useInView(ref, { amount: 0.2 })

  // Parallax: the record drifts back and fades as you scroll into the album
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const recordY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const recordScale = useTransform(scrollYProgress, [0, 1], [1, 0.86])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  useEffect(() => {
    ui.set({ heroVisible: inView })
  }, [inView])

  // A little celebration on milestone days
  useEffect(() => {
    if (!entered || !isMilestone(together(new Date()).days)) return
    const timer = window.setTimeout(() => burstFrom(counterRef.current), 1400)
    return () => window.clearTimeout(timer)
  }, [entered])

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col px-5 pt-[calc(env(safe-area-inset-top)+5rem)] pb-12 lg:px-10"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={entered ? 'shown' : 'hidden'}
        className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-y-8 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_auto] lg:gap-x-16"
      >
        <motion.div variants={rise} className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left">
          <motion.div style={{ opacity: fade }}>
          <p className="eyebrow inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-rose" />
            </span>
            {t('hero.eyebrow', { to: tx(story.her.nameTo) })}
          </p>
          <h1 className="mt-5">
            <span className="block text-[clamp(2.7rem,12vw,5.2rem)] leading-[0.88] font-semibold tracking-[-0.03em] uppercase">
              {t('hero.title1')}
            </span>
            <span className="block font-display text-[clamp(3.4rem,15vw,6.4rem)] leading-[0.9] text-love italic">
              {t('hero.title2')}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-sand lg:mx-0">
            {t('hero.desc', { date: formatDate(START) })}
          </p>
          </motion.div>
        </motion.div>

        <motion.div variants={rise} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <motion.div style={{ y: recordY, scale: recordScale }}>
            <Turntable />
          </motion.div>
        </motion.div>

        <motion.div variants={rise} className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <motion.div style={{ opacity: fade }}>
          <Counter ref={counterRef} align={desktop ? 'left' : 'center'} />
          <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => engine.toggle()}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-ink shadow-[0_12px_40px_-12px_rgba(255,111,145,0.7)]"
            >
              {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
              {playing ? t('hero.pause') : t('hero.play')}
            </motion.button>
            <button
              type="button"
              onClick={() => scrollToId('tracklist')}
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-cream"
            >
              {t('hero.tracklist')} <ArrowDown className="size-4" />
            </button>
          </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: fade }} className="mx-auto mt-6 hidden md:block">
        <motion.button
          type="button"
          onClick={() => scrollToId('tracklist')}
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-dust uppercase"
        >
          {t('hero.sideB')}
          <span className="h-10 w-px animate-float bg-linear-to-b from-dust to-transparent" />
        </motion.button>
      </motion.div>
    </section>
  )
}
