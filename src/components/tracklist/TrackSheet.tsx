import { AnimatePresence, motion } from 'framer-motion'
import { CalendarHeart, ChevronDown, MapPin, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { engine, usePlayer } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useMediaQuery } from '../../lib/dom'
import { EASE } from '../../lib/motion'
import { ui } from '../../lib/store'
import { dayOf, formatDate, pad2 } from '../../lib/time'
import { PlayerCard } from '../player/PlayerCard'
import { Sheet } from '../ui/Sheet'
import { MOOD_COLORS } from './moodColors'
import { Polaroid } from './Polaroid'

/** The full memory: polaroid, note and player. Follows along when the album auto-advances. */
export function TrackSheet() {
  const sheetId = ui.use((s) => s.sheetId)
  const desktop = useMediaQuery('(min-width: 768px)')
  const { t, tx } = useI18n()
  const index = story.tracks.findIndex((t) => t.id === sheetId)
  const track = index >= 0 ? story.tracks[index] : undefined
  const direction = useRef<1 | -1>(1)

  const close = useCallback(() => ui.set({ sheetId: null }), [])
  const go = useCallback(
    (step: 1 | -1) => {
      const next = story.tracks[index + step]
      if (!next) return
      direction.current = step
      ui.set({ sheetId: next.id })
      engine.play(next.id)
    },
    [index],
  )

  // When a song ends and the album rolls on, turn the page with it
  const { currentId } = usePlayer()
  const previous = useRef(currentId)
  useEffect(() => {
    const before = previous.current
    previous.current = currentId
    if (sheetId && before === sheetId && currentId && currentId !== before && story.tracks.some((t) => t.id === currentId)) {
      direction.current = 1
      ui.set({ sheetId: currentId })
    }
  }, [currentId, sheetId])

  // ← / → between memories
  useEffect(() => {
    if (!track) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [track, go])

  const colors = track ? MOOD_COLORS[track.mood] : undefined
  const tint = colors
    ? `radial-gradient(120% 70% at 15% 0%, ${colors[1]}38, transparent 60%), radial-gradient(90% 60% at 100% 100%, ${colors[2]}1f, transparent 65%)`
    : undefined
  const label = track?.audioLabel ? tx(track.audioLabel) : t(track?.audio ? 'sheet.voice' : 'sheet.instrumental')

  return (
    <Sheet open={!!track} onClose={close} labelledBy="memory-title" tint={tint}>
      {track && (
        <AnimatePresence mode="wait" initial={false} custom={direction.current}>
          <motion.article
            key={track.id}
            custom={direction.current}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: 40 * d }),
              center: { opacity: 1, x: 0 },
              leave: (d: number) => ({ opacity: 0, x: -40 * d }),
            }}
            initial="enter"
            animate="center"
            exit="leave"
            transition={{ duration: 0.45, ease: EASE }}
            className="px-5 pt-1 pb-6 md:p-10"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">
                {t('sheet.track', { i: pad2(index + 1), n: pad2(story.tracks.length) })}
                {track.tag && <span className="text-amber"> · {tx(track.tag)}</span>}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="glass grid size-10 shrink-0 place-items-center rounded-full text-cream"
              >
                {desktop ? <X className="size-4" /> : <ChevronDown className="size-5" />}
              </button>
            </div>

            <div className="mt-5 grid items-center gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:gap-12">
              <Polaroid track={track} index={index} />

              <div>
                <h3 id="memory-title" className="font-display text-[clamp(2.6rem,10vw,4.2rem)] leading-[0.95] italic">
                  {tx(track.title)}
                </h3>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] tracking-[0.14em] text-sand uppercase">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarHeart className="size-3.5 text-rose" /> {formatDate(track.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-amber" /> {tx(track.place)}
                  </span>
                  <span>{t('day', { n: dayOf(track.date) })}</span>
                </div>
                <p className="mt-5 text-[15.5px] leading-relaxed text-cream/90 md:text-[17px]">{tx(track.note)}</p>

                <PlayerCard
                  id={track.id}
                  label={label}
                  onPrev={index > 0 ? () => go(-1) : undefined}
                  onNext={index < story.tracks.length - 1 ? () => go(1) : undefined}
                />
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      )}
    </Sheet>
  )
}
