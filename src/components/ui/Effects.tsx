import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { bursts, toasts } from '../../lib/fx'

/** Small glass pills at the top of the screen. */
export function Toaster() {
  const items = toasts.use((s) => s.items)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.6rem)] z-[90] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass-strong rounded-full px-4 py-2 text-sm text-cream"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const COLORS = ['#ff6f91', '#ffc4d1', '#f2a457', '#fff1e6', '#b9a2ff']

/** Hearts that pop out of a point and tumble down. */
export function HeartBursts() {
  const items = bursts.use((s) => s.items)
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {items.map((b) => (
        <Burst key={b.id} x={b.x} y={b.y} />
      ))}
    </div>
  )
}

function Burst({ x, y }: { x: number; y: number }) {
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5
      const speed = 90 + Math.random() * 150
      return {
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 70,
        spin: (Math.random() - 0.5) * 160,
        size: 10 + Math.random() * 14,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.08,
      }
    }),
  )
  return particles.map((p, i) => (
    <motion.span
      key={i}
      className="absolute"
      style={{ left: x, top: y, color: p.color }}
      initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
      animate={{ x: [0, p.dx * 0.75, p.dx], y: [0, p.dy * 0.75, p.dy + 160], scale: [0.3, 1, 0.85], opacity: [1, 1, 0], rotate: p.spin }}
      transition={{ duration: 1.6, ease: 'easeOut', delay: p.delay, times: [0, 0.4, 1] }}
    >
      <Heart className="-translate-x-1/2 -translate-y-1/2 fill-current" style={{ width: p.size, height: p.size }} />
    </motion.span>
  ))
}
