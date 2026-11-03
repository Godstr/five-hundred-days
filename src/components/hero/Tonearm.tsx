import { motion, type MotionValue } from 'framer-motion'

/*
 * Geometry, in % of the record's box: the pivot sits at (96, 4) and the arm,
 * drawn pointing straight down in a 24 × 84 box, swings around it.
 *   rest → -8°  (needle off the record)
 *   play → 14°  (outer groove) … 22° (inner groove, as the song plays)
 */
export const ARM_REST = -8
export const ARM_START = 14
export const ARM_END = 22

export function Tonearm({ angle }: { angle: MotionValue<number> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Base plate: doesn't move */}
      <div
        className="absolute size-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: '96%',
          top: '4%',
          background: 'radial-gradient(circle at 35% 30%, #4a4440, #1d1a18 70%)',
          boxShadow: '0 10px 24px -6px rgb(0 0 0 / 0.8), inset 0 1px 0 rgb(255 255 255 / 0.12)',
        }}
      />
      <motion.div
        className="absolute"
        style={{ left: '84%', top: '-8%', width: '24%', height: '84%', rotate: angle, originX: 0.5, originY: 12 / 84 }}
      >
        <svg viewBox="0 0 24 84" className="size-full overflow-visible drop-shadow-[0_8px_8px_rgba(0,0,0,0.55)]">
          <defs>
            <linearGradient id="arm-metal" x1="0" x2="1">
              <stop offset="0" stopColor="#7d7670" />
              <stop offset="0.45" stopColor="#f1ece6" />
              <stop offset="1" stopColor="#8a837c" />
            </linearGradient>
            <radialGradient id="arm-cap" cx="0.35" cy="0.3">
              <stop offset="0" stopColor="#f6f1ea" />
              <stop offset="1" stopColor="#6f6862" />
            </radialGradient>
          </defs>
          {/* counterweight */}
          <rect x="8.4" y="0.6" width="7.2" height="7.4" rx="1.4" fill="#2b2725" stroke="#57504b" strokeWidth="0.4" />
          <path d="M8.6 2.8h6.8M8.6 4.4h6.8M8.6 6h6.8" stroke="#46403c" strokeWidth="0.35" />
          {/* arm tube with a gentle S-bend */}
          <path d="M12 12 L12 56 Q12 61 10.4 64.5" fill="none" stroke="url(#arm-metal)" strokeWidth="1.5" strokeLinecap="round" />
          {/* pivot cap */}
          <circle cx="12" cy="12" r="4" fill="url(#arm-cap)" />
          <circle cx="12" cy="12" r="1.4" fill="#2b2725" />
          {/* headshell + finger lift */}
          <path d="M8.3 63.6 L12.9 63.6 L12.3 70.6 L8 70.6 Z" fill="#26221f" stroke="#6b645e" strokeWidth="0.35" strokeLinejoin="round" />
          <path d="M12.8 65 L15.2 64.2" stroke="#b9b1a9" strokeWidth="0.7" strokeLinecap="round" />
          <circle cx="10.2" cy="71" r="0.55" fill="#ff8fa8" />
        </svg>
      </motion.div>
    </div>
  )
}
