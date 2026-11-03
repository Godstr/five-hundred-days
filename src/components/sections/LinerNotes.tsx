import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'
import { reveal } from '../../lib/motion'
import { SectionHeading } from '../ui/SectionHeading'

interface Word {
  text: string
  glow: boolean
}

/** Splits the liner notes into words; *starred phrases* glow. */
function parse(text: string): Word[] {
  let open = false
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const starts = raw.startsWith('*')
      const glow = open || starts
      if (starts) open = true
      if (/\*[^\p{L}\p{N}]*$/u.test(raw)) open = false
      return { text: raw.replace(/\*/g, ''), glow }
    })
}

/** A paragraph that lights up word by word as you scroll, like synced lyrics. */
export function LinerNotes() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { lang, t, tx } = useI18n()
  const words = useMemo(() => parse(tx(story.linerNotes)), [lang])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })

  return (
    <section id="liner-notes" className="relative z-10 px-5 py-24 md:py-36 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeading index="03" kicker={t('liner.kicker')} title={t('liner.title')} accent={t('liner.accent')} />
        <p ref={ref} className="mt-14 font-display text-[clamp(1.95rem,6.4vw,3.9rem)] leading-[1.14] font-medium">
          {words.map((word, i) => (
            <LitWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} glow={word.glow}>
              {word.text}
            </LitWord>
          ))}
        </p>
        <motion.p {...reveal} className="mt-10 font-hand text-4xl text-blush">
          — {tx(story.me.name).toLowerCase()}
        </motion.p>
      </div>
    </section>
  )
}

function LitWord({ progress, range, glow, children }: { progress: MotionValue<number>; range: [number, number]; glow: boolean; children: string }) {
  const opacity = useTransform(progress, range, [0.13, 1])
  return (
    <>
      <motion.span style={{ opacity }} className={cn(glow && 'text-blush italic [text-shadow:0_0_28px_rgb(255_111_145/0.45)]')}>
        {children}
      </motion.span>{' '}
    </>
  )
}
