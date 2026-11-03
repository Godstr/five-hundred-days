import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useEscape, useMediaQuery, useScrollLock } from '../../lib/dom'

interface SheetProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  /** Optional background wash, e.g. the memory's colours. */
  tint?: string
  children: ReactNode
}

/**
 * A native-feeling bottom sheet on phones (drag the handle down to dismiss)
 * and a centred dialog on larger screens.
 */
export function Sheet({ open, onClose, labelledBy, tint, children }: SheetProps) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const drag = useDragControls()
  const panel = useRef<HTMLDivElement>(null)
  useScrollLock(open)
  useEscape(open, onClose)

  // Move focus into the dialog, and give it back when it closes
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }))
    return () => {
      cancelAnimationFrame(frame)
      previous?.focus?.({ preventScroll: true })
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6"
          initial="closed"
          animate="open"
          exit="closed"
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="glass-strong relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[30px] outline-none md:max-h-[88vh] md:max-w-5xl md:rounded-[30px]"
            variants={
              desktop
                ? { open: { opacity: 1, scale: 1, y: 0 }, closed: { opacity: 0, scale: 0.96, y: 24 } }
                : { open: { y: 0 }, closed: { y: '100%' } }
            }
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            drag={desktop ? false : 'y'}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 650) onClose()
            }}
          >
            {tint && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: tint }} />}
            {!desktop && (
              <div
                className="relative z-10 flex h-8 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                onPointerDown={(event) => drag.start(event)}
              >
                <span className="h-1.5 w-11 rounded-full bg-white/25" />
              </div>
            )}
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
