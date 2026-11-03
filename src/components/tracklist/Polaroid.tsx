import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { Track } from '../../config/story'
import { useI18n } from '../../i18n'
import { asset } from '../../lib/dom'
import { dayOf, formatDate, pad2 } from '../../lib/time'
import { MemoryArt } from './MemoryArt'

/** A polaroid that drops in at a slight angle. Tap it to flip it over and read what's written on the back. */
export function Polaroid({ track, index }: { track: Track; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const { t, tx } = useI18n()
  const caption = tx(track.caption)
  const [photoFailed, setPhotoFailed] = useState(false)
  const tilt = index % 2 ? 2.5 : -2.5
  const photo = !photoFailed && asset(track.photo)

  return (
    <div className="mx-auto w-[min(70vw,330px)] [perspective:1600px]">
      <motion.button
        type="button"
        onClick={() => track.ps && setFlipped((f) => !f)}
        aria-label={track.ps ? (flipped ? t('polaroid.unflip') : t('polaroid.flip')) : caption}
        initial={{ rotate: tilt * 4, y: 40, opacity: 0 }}
        animate={{ rotate: tilt, y: 0, opacity: 1 }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 110, damping: 14 }}
        className="block w-full"
      >
        <motion.div
          className="relative transform-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
        >
          {/* Front */}
          <div className="relative rounded-[3px] bg-[#fbf8f2] p-[5%] pb-[23%] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] backface-hidden">
            <div className="relative aspect-square overflow-hidden bg-[#1b1416]">
              {photo ? (
                <img
                  src={photo}
                  alt={caption}
                  onError={() => setPhotoFailed(true)}
                  decoding="async"
                  className="size-full object-cover [filter:contrast(1.04)_saturate(1.06)_sepia(0.08)]"
                />
              ) : (
                <MemoryArt mood={track.mood} seed={index} />
              )}
              <div aria-hidden className="absolute inset-0 shadow-[inset_0_0_34px_rgba(0,0,0,0.35)]" />
              <div aria-hidden className="absolute inset-0 bg-linear-to-br from-white/14 via-transparent to-transparent" />
            </div>
            <p className="absolute inset-x-0 bottom-[6%] -rotate-1 px-4 text-center font-hand text-[clamp(1.45rem,6.4vw,1.95rem)] leading-none text-[#2b2320]">
              {caption}
            </p>
          </div>

          {/* Back */}
          <div className="paper absolute inset-0 flex rotate-y-180 flex-col rounded-[3px] p-[9%] text-left shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] backface-hidden">
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#9b7d68] uppercase">
              {t('polaroid.back', { i: pad2(index + 1), d: dayOf(track.date) })}
            </p>
            <p className="mt-5 font-hand text-[clamp(1.55rem,6.8vw,2.05rem)] leading-[1.15] text-sepia">{track.ps && tx(track.ps)}</p>
            <div className="mt-auto flex items-end justify-between">
              <span className="-rotate-6 border border-[#c0392b]/70 px-2 py-0.5 font-mono text-[11px] tracking-[0.1em] text-[#c0392b]/80 uppercase">
                {formatDate(track.date, 'short')}
              </span>
              <Heart className="size-7 fill-rose/80 text-rose" />
            </div>
          </div>
        </motion.div>
      </motion.button>
      {track.ps && (
        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.22em] text-dust uppercase">
          {flipped ? t('polaroid.hintBack') : t('polaroid.hint')}
        </p>
      )}
    </div>
  )
}
