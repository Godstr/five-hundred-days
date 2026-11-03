import { motion } from 'framer-motion'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { Vinyl } from '../ui/Vinyl'

/** The album cover, with the record sliding out of the sleeve as it scrolls into view. */
export function AlbumSleeve({ spinning }: { spinning: boolean }) {
  const { t, tx } = useI18n()
  return (
    <div className="mx-auto w-[min(88vw,440px)]">
      <div className="relative w-[74%] [container-type:inline-size]">
        <motion.div
          className="absolute inset-[3%]"
          initial={{ x: '0%', rotate: 0 }}
          whileInView={{ x: '34%', rotate: 40 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 45, damping: 14 }}
        >
          <Vinyl spinning={spinning} />
        </motion.div>

        <div
          className="relative aspect-square overflow-hidden rounded-[4px]"
          style={{ boxShadow: '0 40px 70px -24px rgb(0 0 0 / 0.95), inset 0 0 0 1px rgb(255 255 255 / 0.07)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(110% 80% at 18% 8%, #ff8fa8 0%, transparent 52%), radial-gradient(90% 70% at 95% 100%, #f2a457 0%, transparent 58%), linear-gradient(160deg, #4a1229 0%, #1a0b12 70%)',
            }}
          />
          <div className="noise absolute inset-0 opacity-40 mix-blend-overlay" />

          <div className="absolute inset-x-[7%] top-[7%] flex justify-between font-mono text-[3cqw] tracking-[0.3em] text-cream/80 uppercase">
            <span>{tx(story.album.edition)}</span>
            <span>{t('sleeve.number')}</span>
          </div>

          <p className="absolute inset-x-0 top-[13%] text-center font-display text-[46cqw] leading-none font-light text-cream/95 italic mix-blend-soft-light">
            500
          </p>

          <div className="absolute bottom-[7%] left-[7%]">
            <p className="text-[6.6cqw] leading-none font-semibold tracking-[-0.02em] text-cream uppercase">{t('sleeve.title1')}</p>
            <p className="font-display text-[8.4cqw] leading-[1.05] text-blush italic">{t('sleeve.title2')}</p>
            <p className="mt-[1.5cqw] font-mono text-[2.6cqw] tracking-[0.2em] text-cream/70 uppercase">{tx(story.album.artist)}</p>
          </div>

          {/* The parody parental-advisory sticker */}
          <div className="absolute right-[6%] bottom-[7%] w-[23%] bg-black text-center leading-none text-white ring-1 ring-white/80">
            <p className="pt-[1.4cqw] text-[2.4cqw] font-bold tracking-[0.1em] uppercase">{t('sleeve.sticker1')}</p>
            <p className="pb-[1.2cqw] text-[3.9cqw] font-black tracking-tight uppercase">{t('sleeve.sticker2')}</p>
            <p className="bg-white py-[0.9cqw] text-[2.3cqw] font-black tracking-[0.06em] text-black uppercase">{t('sleeve.sticker3')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
