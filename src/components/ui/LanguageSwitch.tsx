import { motion } from 'framer-motion'
import { useId } from 'react'
import { LANGS, setLang, useI18n, type Lang } from '../../i18n'
import { cn } from '../../lib/dom'

const LABELS: Record<Lang, string> = { en: 'EN', mn: 'МН' }

/** A two-way EN / МН pill with a sliding highlight. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { lang, t } = useI18n()
  const highlight = useId()

  return (
    <div role="radiogroup" aria-label={t('lang.label')} className={cn('glass flex h-10 items-center rounded-full p-1', className)}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={lang === code}
          onClick={() => setLang(code)}
          className={cn(
            'relative h-full min-w-9 rounded-full px-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] transition-colors',
            lang === code ? 'text-ink' : 'text-sand hover:text-cream',
          )}
        >
          {lang === code && (
            <motion.span
              layoutId={highlight}
              className="absolute inset-0 rounded-full bg-cream"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative">{LABELS[code]}</span>
        </button>
      ))}
    </div>
  )
}
