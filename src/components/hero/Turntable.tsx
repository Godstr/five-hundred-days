import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { LoaderCircle, Mic, Play } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { engine, SIDE_A_ID, usePlayer, VOICE_NOTE_ID } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'
import { Equalizer } from '../player/Equalizer'
import { Vinyl } from '../ui/Vinyl'
import { ARM_END, ARM_REST, ARM_START, Tonearm } from './Tonearm'

/** 33⅓ rpm = 200° per second. */
const RECORD_SPEED = 200

/**
 * The hero record player. Tap the vinyl to play / pause. The platter spins up
 * and down with inertia, the tonearm swings in and tracks inward as the song
 * plays, the halo breathes with the music, and on desktop it tilts toward the cursor.
 */
export function Turntable() {
  const { currentId, status } = usePlayer()
  const active = status === 'playing' || status === 'loading'
  const reduced = useReducedMotion()
  const { t, tx } = useI18n()

  const rotate = useMotionValue(0)
  const velocity = useRef(0)
  const level = useMotionValue(0)
  const armTarget = useMotionValue(ARM_REST)
  const arm = useSpring(armTarget, { stiffness: 36, damping: 12 })
  const glowOpacity = useTransform(level, [0, 1], [0.3, 0.95])
  const glowScale = useTransform(level, [0, 1], [0.94, 1.08])

  const tiltX = useSpring(0, { stiffness: 120, damping: 18 })
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(tiltX, (v) => 12 + v)
  const rotateY = useTransform(tiltY, (v) => -6 + v)

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64) / 1000
    const target = active ? RECORD_SPEED * (reduced ? 0.35 : 1) : 0
    velocity.current += (target - velocity.current) * (1 - Math.exp(-dt * (active ? 2.2 : 1.1)))
    rotate.set((rotate.get() + velocity.current * dt) % 360)
    level.set(engine.getLevel())
    const progress = engine.duration ? engine.time / engine.duration : 0
    armTarget.set(active ? ARM_START + (ARM_END - ARM_START) * progress : ARM_REST)
  })

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 16)
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 16)
  }
  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  const source = engine.getSource(currentId) ?? engine.getSource(SIDE_A_ID)
  const voiceNote = story.voiceNote.src ? VOICE_NOTE_ID : null
  const voicePlaying = currentId === VOICE_NOTE_ID && active

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[min(72vw,360px)] [perspective:1400px] sm:w-[min(60vw,400px)] lg:w-[min(38vw,500px)]"
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
      >
        {/* Halo that breathes with the music */}
        <motion.div
          aria-hidden
          className="absolute -inset-[22%] rounded-full"
          style={{
            opacity: glowOpacity,
            scale: glowScale,
            background:
              'radial-gradient(closest-side, rgb(255 111 145 / 0.42), rgb(242 164 87 / 0.16) 55%, transparent 75%)',
          }}
        />

        <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
          <motion.div
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Thickness + shadow, visible as the record tilts */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-[#060506]"
              style={{ transform: 'translateZ(-10px)', boxShadow: '0 50px 90px -20px rgb(0 0 0 / 0.95)' }}
            />

            {!active && (
              <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-blush/30" />
            )}

            <motion.button
              type="button"
              onClick={() => engine.toggle()}
              whileTap={{ scale: 0.97 }}
              aria-label={`${active ? t('pause') : t('play')} · ${source?.title() ?? ''}`}
              aria-pressed={active}
              className="relative block w-full rounded-full"
            >
              <Vinyl rotate={rotate} />
            </motion.button>

            <Tonearm angle={arm} />
          </motion.div>
        </motion.div>
      </div>

      {/* Status line under the record */}
      <div className="mt-6 flex h-6 items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-sand uppercase">
        {status === 'loading' ? (
          <>
            <LoaderCircle className="size-3.5 animate-spin text-blush" /> {t('deck.loading')}
          </>
        ) : active ? (
          <>
            <Equalizer active className="text-rose" /> {t('deck.playing', { title: source?.title() ?? '' })}
          </>
        ) : (
          <>
            <Play className="size-3 fill-current text-blush" /> {t('deck.idle')}
          </>
        )}
      </div>

      {voiceNote && (
        <motion.button
          type="button"
          onClick={() => engine.toggle(voiceNote)}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'glass mt-4 flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-left text-sm transition-colors',
            voicePlaying && 'border-rose/40',
          )}
        >
          <span className="grid size-8 place-items-center rounded-full bg-rose/90 text-ink">
            {voicePlaying ? <Equalizer active className="text-ink" /> : <Mic className="size-4" />}
          </span>
          <span className="text-cream">{tx(story.voiceNote.title)}</span>
        </motion.button>
      )}
    </div>
  )
}
