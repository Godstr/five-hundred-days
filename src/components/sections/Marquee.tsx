import { Fragment } from 'react'
import { useI18n } from '../../i18n'
import { useTogether } from '../../lib/clock'
import { formatNumber } from '../../lib/time'

/** The ✦ ticker between the hero and the album. */
export function Marquee() {
  const { days, totalSeconds } = useTogether()
  const { t } = useI18n()
  const items = [
    t('marquee.days', { n: days }),
    t('marquee.hours', { n: formatNumber(Math.floor(totalSeconds / 3600)) }),
    t('marquee.voice'),
    t('marquee.bugs'),
    t('marquee.sides'),
    t('marquee.encore'),
  ]
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item, i) => (
        <Fragment key={item}>
          <span className={i % 2 ? 'font-display text-[1.9rem] italic text-blush normal-case' : 'text-[1.35rem] font-semibold tracking-[0.06em]'}>
            {item}
          </span>
          <span className="text-amber">✦</span>
        </Fragment>
      ))}
    </div>
  )

  return (
    <div aria-hidden className="relative z-10 overflow-hidden border-y border-white/8 bg-ink/40 py-5 uppercase mask-fade-x">
      <div className="flex w-max animate-marquee">
        {row}
        {row}
      </div>
    </div>
  )
}
