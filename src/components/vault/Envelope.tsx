import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { EASE } from '../../lib/motion'

/** A cream envelope with a wax seal. Opening it lifts the flap and slides the letter out. */
export function Envelope({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const { t, tx } = useI18n()
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={opened ? t('envelope.again') : t('envelope.open')}
      whileHover={{ y: -4, rotate: -1.5 }}
      whileTap={{ scale: 0.97 }}
      className="relative block aspect-[1.45] w-full [container-type:inline-size] [perspective:900px]"
    >
      {/* Back of the envelope */}
      <div className="absolute inset-0 rounded-[6px] bg-[#e6d6be] shadow-[0_22px_40px_-12px_rgba(0,0,0,0.8)]" />

      {/* The letter */}
      <motion.div
        className="paper absolute inset-x-[7%] top-[7%] h-[82%] rounded-[3px] px-[8%] pt-[7%] text-left shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
        animate={{ y: opened ? '-52%' : '0%' }}
        transition={{ delay: opened ? 0.35 : 0, type: 'spring', stiffness: 110, damping: 16 }}
      >
        <p className="font-hand text-[8cqw] leading-none text-sepia">{tx(story.letter.greeting)}</p>
        {[92, 80, 88, 60].map((w, i) => (
          <span key={i} className="mt-[3.2cqw] block h-[1.4cqw] rounded-full bg-sepia/15" style={{ width: `${w}%` }} />
        ))}
      </motion.div>

      {/* Front pocket */}
      <div
        className="absolute inset-0 rounded-[6px]"
        style={{ background: 'linear-gradient(180deg, #f2e7d4, #eadcc5)', clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)' }}
      />
      <div className="absolute inset-0 rounded-[6px] bg-[#e3d2b8]" style={{ clipPath: 'polygon(0 0, 50% 54%, 0 100%)' }} />
      <div className="absolute inset-0 rounded-[6px] bg-[#e3d2b8]" style={{ clipPath: 'polygon(100% 0, 50% 54%, 100% 100%)' }} />
      <p className="absolute right-[7%] bottom-[9%] font-hand text-[6.5cqw] text-sepia/70">{t('envelope.for', { to: tx(story.her.nameTo) })}</p>

      {/* Flap: tucks behind the letter once it's past vertical */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[56%] origin-top"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'linear-gradient(180deg, #efe2cc, #ddcbaf)' }}
        initial={false}
        animate={{ rotateX: opened ? 180 : 0, zIndex: opened ? 0 : 3 }}
        transition={{ rotateX: { duration: 0.6, ease: EASE }, zIndex: { delay: opened ? 0.3 : 0, duration: 0 } }}
      />

      {/* Wax seal */}
      <motion.div
        className="absolute top-[54%] left-1/2 z-[4] grid size-[21%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #ff8fa8, #c2185b 55%, #6e0f34)',
          boxShadow: '0 4px 10px rgb(80 0 30 / 0.55), inset 0 -3px 6px rgb(0 0 0 / 0.3), inset 0 2px 3px rgb(255 255 255 / 0.3)',
        }}
        initial={false}
        animate={{ scale: opened ? 0 : 1, opacity: opened ? 0 : 1, rotate: opened ? 40 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <Heart className="size-[46%] fill-[#ffd1dc] text-[#ffd1dc]" />
      </motion.div>
    </motion.button>
  )
}
