import { motion, useAnimationFrame } from 'framer-motion'
import { AudioLines, LoaderCircle, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { engine, usePlayer } from '../../audio'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'
import { formatClock } from '../../lib/time'
import { Equalizer } from './Equalizer'

interface PlayerCardProps {
  id: string
  label: string
  onPrev?: () => void
  onNext?: () => void
}

/** The player inside a memory: label, scrubber, previous / play / next. */
export function PlayerCard({ id, label, onPrev, onNext }: PlayerCardProps) {
  const { currentId, status } = usePlayer()
  const { t } = useI18n()
  const current = currentId === id
  const loading = current && status === 'loading'
  const playing = current && (status === 'playing' || loading)

  return (
    <div className="glass mt-6 rounded-3xl p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-sand uppercase">
          <AudioLines className="size-3.5 text-rose" /> {label}
        </p>
        <Equalizer active={current && status === 'playing'} className={cn('text-rose', !current && 'opacity-30')} />
      </div>

      <Scrubber active={current} />

      <div className="mt-2 flex items-center justify-center gap-8">
        <RoundButton label={t('player.prev')} onClick={onPrev}>
          <SkipBack className="size-5 fill-current" />
        </RoundButton>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => engine.toggle(id)}
          aria-label={playing ? t('pause') : t('play')}
          className="grid size-16 place-items-center rounded-full bg-cream text-ink shadow-[0_12px_34px_-10px_rgba(255,111,145,0.75)]"
        >
          {loading ? (
            <LoaderCircle className="size-6 animate-spin" />
          ) : playing ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 translate-x-0.5 fill-current" />
          )}
        </motion.button>
        <RoundButton label={t('player.next')} onClick={onNext}>
          <SkipForward className="size-5 fill-current" />
        </RoundButton>
      </div>
    </div>
  )
}

function RoundButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      disabled={!onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full text-cream transition-opacity disabled:opacity-25"
    >
      {children}
    </motion.button>
  )
}

/** A progress bar you can tap or drag to seek. Updates through refs, so it never re-renders while playing. */
export function Scrubber({ active }: { active: boolean }) {
  const { t } = useI18n()
  const bar = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const elapsed = useRef<HTMLSpanElement>(null)
  const total = useRef<HTMLSpanElement>(null)

  useAnimationFrame(() => {
    const time = active ? engine.time : 0
    const duration = active ? engine.duration : 0
    const progress = duration ? Math.min(1, time / duration) : 0
    if (fill.current) fill.current.style.transform = `scaleX(${progress})`
    if (knob.current) knob.current.style.left = `${progress * 100}%`
    if (elapsed.current) elapsed.current.textContent = formatClock(time)
    if (total.current) total.current.textContent = duration ? formatClock(duration) : '–:––'
    bar.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
  })

  const seekTo = (event: PointerEvent<HTMLDivElement>) => {
    if (!active || !bar.current) return
    const rect = bar.current.getBoundingClientRect()
    engine.seek(((event.clientX - rect.left) / rect.width) * engine.duration)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!active) return
    if (event.key === 'ArrowRight') engine.seek(engine.time + 5)
    if (event.key === 'ArrowLeft') engine.seek(engine.time - 5)
  }

  return (
    <div className="mt-3">
      <div
        ref={bar}
        role="slider"
        aria-label={t('player.seek')}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={active ? 0 : -1}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          seekTo(event)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) seekTo(event)
        }}
        className={cn('group relative flex h-7 touch-none items-center', active ? 'cursor-pointer' : 'cursor-default')}
      >
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/12">
          <div ref={fill} className="absolute inset-0 origin-left rounded-full bg-linear-to-r from-rose to-amber" style={{ transform: 'scaleX(0)' }} />
        </div>
        <div
          ref={knob}
          className={cn(
            'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow transition-opacity',
            active ? 'opacity-100' : 'opacity-0',
          )}
          style={{ left: 0 }}
        />
      </div>
      <div className="flex justify-between font-mono text-[11px] text-dust tabular-nums">
        <span ref={elapsed}>0:00</span>
        <span ref={total}>–:––</span>
      </div>
    </div>
  )
}
