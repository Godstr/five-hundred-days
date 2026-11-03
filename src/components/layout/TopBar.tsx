import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'
import { engine, useIsPlaying } from '../../audio'
import { useI18n } from '../../i18n'
import { cn, scrollToId } from '../../lib/dom'
import { printLoveNote } from '../../lib/easterEggs'
import { ui } from '../../lib/store'
import { Equalizer } from '../player/Equalizer'
import { LanguageSwitch } from '../ui/LanguageSwitch'

const LINKS = [
  { id: 'tracklist', label: 'nav.tracklist' },
  { id: 'liner-notes', label: 'nav.liner' },
  { id: 'vault', label: 'nav.vault' },
] as const

export function TopBar() {
  const entered = ui.use((s) => s.entered)
  const playing = useIsPlaying()
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  // Phones have no inspector: five quick taps on the logo open the secret terminal instead
  const taps = useRef<number[]>([])
  const onLogo = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 2000), now]
    if (taps.current.length >= 5) {
      taps.current = []
      printLoveNote()
      ui.set({ terminalOpen: true })
    } else if (taps.current.length === 1) {
      scrollToId('top')
    }
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={entered ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 pt-safe"
    >
      <div
        className={cn(
          'mx-auto mt-2 flex h-14 max-w-6xl items-center justify-between rounded-full px-3 transition-all duration-500 md:mt-3 md:px-4',
          scrolled ? 'glass mx-3 md:mx-auto' : 'border border-transparent',
        )}
      >
        <button type="button" onClick={onLogo} aria-label={t('nav.top')} className="flex items-center gap-2.5 rounded-full py-1 pr-2">
          <span className="relative grid size-8 place-items-center rounded-full bg-[#121013] ring-1 ring-white/10">
            <span className="absolute inset-[3px] rounded-full bg-[repeating-radial-gradient(circle,#1a171b_0,#1a171b_1px,#242026_1.5px)]" />
            <span className="relative size-3 rounded-full bg-linear-to-br from-blush to-rose" />
          </span>
          <span className="text-sm font-semibold tracking-[0.18em]">
            500 <span className="text-amber">DAYS</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] text-sand uppercase transition-colors hover:bg-white/5 hover:text-cream"
            >
              {t(link.label)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
        <LanguageSwitch />
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => engine.toggle()}
          aria-label={playing ? t('music.pause') : t('music.play')}
          className="glass flex h-10 items-center gap-2 rounded-full px-3.5 text-cream"
        >
          {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-sand" />}
          <Equalizer active={playing} className={cn('h-3 text-rose transition-opacity', !playing && 'opacity-40')} />
        </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
