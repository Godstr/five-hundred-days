import { AnimatePresence, motion, useAnimationFrame } from 'framer-motion'
import { LoaderCircle, Pause, Play, SkipForward } from 'lucide-react'
import { useRef } from 'react'
import { engine, SIDE_A_ID, usePlayer } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { scrollToId } from '../../lib/dom'
import { ui } from '../../lib/store'
import { pad2 } from '../../lib/time'
import { Vinyl } from '../ui/Vinyl'

/** The floating mini player, like Apple Music's. Shows once you scroll past the big record. */
export function NowPlayingBar() {
  const { currentId, status } = usePlayer()
  const { t, tx } = useI18n()
  const entered = ui.use((s) => s.entered)
  const heroVisible = ui.use((s) => s.heroVisible)
  const sheetOpen = ui.use((s) => s.sheetId !== null)
  const letterOpen = ui.use((s) => s.letterOpen)
  const progress = useRef<HTMLDivElement>(null)

  useAnimationFrame(() => {
    const d = engine.duration
    if (progress.current) progress.current.style.transform = `scaleX(${d ? engine.time / d : 0})`
  })

  const source = engine.getSource(currentId)
  const trackIndex = story.tracks.findIndex((t) => t.id === currentId)
  const visible = entered && !!source && !heroVisible && !sheetOpen && !letterOpen
  const playing = status === 'playing' || status === 'loading'

  const open = () => {
    if (trackIndex >= 0) ui.set({ sheetId: currentId })
    else scrollToId('top')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe"
        >
          <div className="glass-strong relative mx-auto flex max-w-lg items-center gap-3 overflow-hidden rounded-[22px] py-2.5 pr-2.5 pl-2.5">
            <button type="button" onClick={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <Vinyl spinning={status === 'playing'} detail="mini" className="size-11 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-cream">{source?.title()}</span>
                <span className="block truncate font-mono text-[10px] tracking-[0.14em] text-dust uppercase">
                  {trackIndex >= 0 ? t('mini.track', { i: pad2(trackIndex + 1), album: tx(story.album.title) }) : tx(story.album.title)}
                </span>
              </span>
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => engine.toggle()}
              aria-label={playing ? t('pause') : t('play')}
              className="grid size-11 place-items-center rounded-full bg-cream text-ink"
            >
              {status === 'loading' ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : playing ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 translate-x-px fill-current" />
              )}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => engine.next()}
              aria-label={currentId === SIDE_A_ID ? t('album.play') : t('mini.next')}
              disabled={trackIndex === story.tracks.length - 1}
              className="grid size-11 place-items-center rounded-full text-cream disabled:opacity-30"
            >
              <SkipForward className="size-5 fill-current" />
            </motion.button>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/8">
              <div ref={progress} className="h-full origin-left bg-linear-to-r from-rose to-amber" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
