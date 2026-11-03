import { motion } from 'framer-motion'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useTogether } from '../../lib/clock'
import { EASE, reveal } from '../../lib/motion'
import { formatNumber } from '../../lib/time'
import { SectionHeading } from '../ui/SectionHeading'

/** The back of the sleeve: album credits plus live stats that tick every second. */
export function Credits() {
  const { totalSeconds } = useTogether()
  const { t, tx } = useI18n()
  const stats = [
    { value: formatNumber(Math.floor(totalSeconds / 3600)), label: t('stats.hours') },
    { value: formatNumber(Math.floor(totalSeconds / 60)), label: t('stats.minutes') },
    { value: formatNumber(totalSeconds), label: t('stats.seconds'), live: true },
    { value: formatNumber(Math.floor(totalSeconds * 1.2)), label: t('stats.beats'), live: true },
  ]

  return (
    <section id="credits" className="relative z-10 px-5 py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="04" kicker={t('credits.kicker')} title={t('credits.title')} accent={t('credits.accent')} />

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <motion.div {...reveal} className="glass rounded-[2rem] p-6 md:p-10">
            <p className="eyebrow">{t('credits.personnel')}</p>
            <dl className="mt-6 divide-y divide-white/8">
              {story.credits.map((credit, i) => (
                <div key={i} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="font-mono text-[11px] tracking-[0.2em] text-dust uppercase sm:pt-0.5">{tx(credit.role)}</dt>
                  <dd className="text-[15px] text-cream">{tx(credit.name)}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                className="glass flex flex-col justify-between rounded-[1.6rem] p-4 md:p-6"
              >
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-dust uppercase md:text-[10px]">
                  {stat.live && <span className="size-1.5 animate-pulse rounded-full bg-rose" />}
                  {stat.label}
                </span>
                <span className="mt-6 font-display text-[clamp(1.6rem,6.5vw,2.9rem)] leading-none font-medium break-all text-cream tabular-nums">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
