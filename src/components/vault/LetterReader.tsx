import { AnimatePresence, motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { useEscape, useScrollLock } from '../../lib/dom'
import { ui } from '../../lib/store'
import { formatDate, together } from '../../lib/time'

/** The letter, unfolded on paper. */
export function LetterReader() {
  const open = ui.use((s) => s.letterOpen)
  const close = useCallback(() => ui.set({ letterOpen: false }), [])
  useScrollLock(open)
  useEscape(open, close)
  const { t, tx } = useI18n()
  const { letter } = story
  const body = tx(letter.body)

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={close} />
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-greeting"
            className="paper relative max-h-[94dvh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] px-7 pt-14 pb-[calc(env(safe-area-inset-bottom)+3rem)] text-sepia shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] md:max-h-[90vh] md:max-w-2xl md:rounded-[18px] md:px-16 md:py-16"
            initial={{ y: '45%', rotateX: 22, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            exit={{ y: '30%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 20 }}
            style={{ transformPerspective: 1200 }}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t('letter.close')}
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-sepia/10 text-sepia transition-colors hover:bg-sepia/20"
            >
              <X className="size-4" />
            </button>

            <p className="font-mono text-[10px] tracking-[0.3em] text-[#a3846f] uppercase">
              {t('letter.header', { n: together(new Date()).days })}
            </p>
            <motion.h3
              id="letter-greeting"
              className="mt-6 font-hand text-[3.2rem] leading-none text-[#2b1d17]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {tx(letter.greeting)}
            </motion.h3>

            {body.map((paragraph, i) => (
              <motion.p
                key={i}
                className="mt-5 font-display text-[1.34rem] leading-[1.55] md:text-[1.45rem]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.18, duration: 0.8 }}
              >
                {paragraph}
              </motion.p>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + body.length * 0.18, duration: 1 }}>
              <p className="mt-10 font-display text-xl italic">{tx(letter.closing)}</p>
              <p className="mt-1 -rotate-2 font-hand text-[3.2rem] leading-none text-[#b0204f]">{tx(letter.signature)}</p>
              <div className="mt-12 flex items-center justify-between border-t border-sepia/15 pt-5">
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#a3846f] uppercase">{formatDate(new Date())}</span>
                <Heart className="size-6 fill-rose text-rose" />
              </div>
            </motion.div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
