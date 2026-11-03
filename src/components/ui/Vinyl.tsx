import { motion, type MotionValue } from 'framer-motion'
import { useId } from 'react'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'

interface VinylProps {
  /** Rotation in degrees, driven from outside (the hero turntable spins up and down like a real motor). */
  rotate?: MotionValue<number>
  /** Simple CSS spin for the small records. */
  spinning?: boolean
  /** Full detail draws the curved label text and the gaps between tracks. */
  detail?: 'full' | 'mini'
  className?: string
}

/** The quiet gaps between songs you can see on a real LP: one per track. */
function trackGaps(count: number): string {
  const stops: string[] = []
  for (let i = 1; i < count; i++) {
    const r = 39 + ((95 - 39) * i) / count
    stops.push(`transparent ${(r - 0.55).toFixed(2)}%`, `rgb(255 255 255 / 0.05) ${r.toFixed(2)}%`, `transparent ${(r + 0.55).toFixed(2)}%`)
  }
  return `radial-gradient(circle closest-side, transparent 38%, ${stops.join(', ')}, transparent 96%)`
}

const GAPS = trackGaps(story.tracks.length)

export function Vinyl({ rotate, spinning, detail = 'full', className }: VinylProps) {
  const pathId = `label-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { t, tx } = useI18n()
  const labelText = t('vinyl.label', { title: tx(story.album.title), to: tx(story.her.nameTo) }).toUpperCase()

  return (
    <div className={cn('relative aspect-square rounded-full [container-type:inline-size]', className)}>
      <motion.div
        className={cn('vinyl-disc', spinning !== undefined && 'animate-spin-slow')}
        style={{ rotate, animationPlayState: spinning === false ? 'paused' : undefined }}
      >
        {detail === 'full' && <div className="absolute inset-0 rounded-full" style={{ background: GAPS }} />}

        {/* Label */}
        <div
          className="absolute inset-[31%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 32% 26%, #ffe3d3 0%, #ff9fb3 36%, #e5577d 70%, #9e2a52 100%)',
            boxShadow: '0 0 0 1px rgb(0 0 0 / 0.35), inset 0 0 14px rgb(80 10 35 / 0.35)',
          }}
        >
          <div className="absolute inset-[17%] rounded-full border border-[#5c1530]/25" />
          {detail === 'full' && (
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
              <defs>
                <path id={pathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text fill="#4a1426" fontSize="6.6" fontWeight="600" style={{ fontFamily: 'var(--font-mono)' }}>
                <textPath href={`#${pathId}`} textLength="235" lengthAdjust="spacing">
                  {labelText}
                </textPath>
              </text>
            </svg>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#3d0f20]">
            <span className="font-display text-[8cqw] leading-none font-semibold italic">500</span>
            <span className="my-[2.2cqw] size-[3.4cqw] rounded-full bg-[#0d0b0c] shadow-[inset_0_1px_2px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.35)]" />
            {detail === 'full' && <span className="font-mono text-[1.9cqw] font-semibold tracking-[0.3em] uppercase">{t('vinyl.side')}</span>}
          </div>
        </div>
      </motion.div>
      <div className="vinyl-sheen" />
    </div>
  )
}
