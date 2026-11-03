import { Sparkles } from 'lucide-react'
import type { Ref } from 'react'
import { useI18n } from '../../i18n'
import { useTogether } from '../../lib/clock'
import { formatDate, isMilestone, nextMilestone, START } from '../../lib/time'
import { RollingNumber } from '../ui/RollingNumber'

/** The live "days together" counter: a huge serif day count plus hours / minutes / seconds chips. */
export function Counter({ align = 'center', ref }: { align?: 'center' | 'left'; ref?: Ref<HTMLDivElement> }) {
  const { days, hours, minutes, seconds } = useTogether()
  const { t } = useI18n()
  const next = nextMilestone(days)
  const centered = align === 'center'

  return (
    <div ref={ref} className={centered ? 'flex flex-col items-center text-center' : 'flex flex-col items-start'}>
      <p className="eyebrow">{t('counter.label')}</p>

      <div className="mt-1 flex items-end gap-3">
        <RollingNumber
          value={days}
          className="font-display text-[clamp(6rem,30vw,9rem)] leading-[0.82] font-medium italic"
          digitClassName="text-love"
        />
        <span className="mb-[0.9em] font-display text-2xl text-sand italic">{t('counter.days')}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <Chip value={hours} unit={t('counter.hours')} />
        <Chip value={minutes} unit={t('counter.min')} />
        <Chip value={seconds} unit={t('counter.sec')} />
      </div>

      <p className="mt-4 font-mono text-[11px] tracking-[0.12em] text-dust">{t('counter.since', { date: formatDate(START, 'weekday') })}</p>

      {isMilestone(days) ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1.5 text-xs font-medium text-amber">
          <Sparkles className="size-3.5" /> {t('counter.today', { n: days })} · <span className="text-shine">{t('counter.cheers')}</span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-sand">
          {t('counter.next')} <span className="text-cream">{t('day', { n: next.day })}</span> · {t('counter.in', { n: next.inDays })}
        </p>
      )}
    </div>
  )
}

function Chip({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="glass min-w-[4.6rem] rounded-2xl px-3 pt-2 pb-1.5 text-center">
      <RollingNumber value={value} pad={2} className="font-mono text-xl font-medium text-cream" />
      <div className="mt-0.5 font-mono text-[9px] tracking-[0.22em] text-dust uppercase">{unit}</div>
    </div>
  )
}
