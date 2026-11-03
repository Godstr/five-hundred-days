import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useTogether } from '../../lib/clock'
import { scrollToId } from '../../lib/dom'
import { reveal } from '../../lib/motion'
import { formatDate, nextMilestone } from '../../lib/time'

export function Footer() {
  const { days } = useTogether()
  const next = nextMilestone(days)
  const { t, tx } = useI18n()

  return (
    <footer className="relative z-10 px-5 pt-24 pb-[calc(env(safe-area-inset-bottom)+8rem)] text-center lg:px-10">
      <motion.div {...reveal}>
        <p className="eyebrow">{t('footer.kicker')}</p>
        <p className="mt-4 font-display text-[clamp(5rem,22vw,12rem)] leading-[0.85] text-love italic">{t('footer.encore')}</p>
        <p className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-sand">
          {t('footer.next', { day: t('day', { n: next.day }), date: formatDate(next.date), n: next.inDays })}
        </p>
        <button
          type="button"
          onClick={() => scrollToId('top')}
          className="glass mt-10 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-cream"
        >
          <ArrowUp className="size-4" /> {t('footer.again')}
        </button>
      </motion.div>

      <div className="mt-20 space-y-2 font-mono text-[11px] tracking-[0.08em] text-dust">
        <p>{t('footer.made', { me: tx(story.me.name) })}</p>
        <p className="text-dust/70">
          <span className="hidden [@media(hover:hover)]:inline">{t('footer.psstDesktop')}</span>
          <span className="[@media(hover:hover)]:hidden">{t('footer.psstTouch')}</span>
        </p>
      </div>
    </footer>
  )
}
