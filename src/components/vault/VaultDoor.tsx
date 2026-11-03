import { motion } from 'framer-motion'
import { Heart, Lock } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { EASE } from '../../lib/motion'

export type VaultPhase = 'locked' | 'unlocking' | 'open'
export type CodeStatus = 'idle' | 'error' | 'success'

const ROSE_GOLD = 'linear-gradient(145deg, #ffe0d2 0%, #e7a99a 38%, #b5746a 70%, #7d4a44 100%)'
const BOLTS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6)

interface VaultDoorProps {
  phase: VaultPhase
  /** Dial rotation in degrees: it turns with every digit, like a combination lock. */
  dial: number
  status: CodeStatus
  ref?: Ref<HTMLDivElement>
  /** What's waiting inside. */
  children?: ReactNode
}

/** A round safe door in brushed metal and rose gold that unbolts and swings open on its hinge. */
export function VaultDoor({ phase, dial, status, ref, children }: VaultDoorProps) {
  const unlocked = phase !== 'locked'
  const led = status === 'error' ? '#ff5a5a' : unlocked || status === 'success' ? '#5df2b0' : '#ff6f91'

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-[min(80vw,380px)] [container-type:inline-size] [perspective:1400px]">
      {/* The opening in the wall */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 210deg, #3a3430, #1d1a18, #47413c, #1a1716, #3a3430)',
          boxShadow: '0 50px 90px -30px rgb(0 0 0 / 0.95), inset 0 2px 1px rgb(255 255 255 / 0.08)',
        }}
      />
      {/* The inside of the safe */}
      <div
        className="absolute inset-[6%] grid place-items-center overflow-hidden rounded-full"
        style={{ background: 'radial-gradient(circle at 50% 40%, #2b1a20, #0b0809 72%)', boxShadow: 'inset 0 24px 60px rgb(0 0 0 / 0.95)' }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgb(255_111_145/0.32),transparent_62%)]"
          initial={false}
          animate={{ opacity: unlocked ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
        {children}
      </div>

      {/* The door */}
      <motion.div
        className="pointer-events-none absolute inset-[4.5%] rounded-full"
        style={{ transformOrigin: '0% 50%', transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: phase === 'open' ? -118 : 0 }}
        transition={{ type: 'spring', stiffness: 38, damping: 11, mass: 1.2 }}
      >
        {/* Back of the door, seen once it swings past 90° */}
        <div className="absolute inset-0 rounded-full bg-[#161312]" style={{ transform: 'translateZ(-14px)' }} />

        <div
          className="absolute inset-0 rounded-full backface-hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 24%, rgb(255 255 255 / 0.13), transparent 46%), repeating-conic-gradient(from 0deg, rgb(255 255 255 / 0.025) 0deg 1deg, rgb(0 0 0 / 0.03) 1deg 2deg), conic-gradient(from 200deg, #3c3733, #25211f, #46413c, #201d1b, #3c3733)',
            boxShadow: 'inset 0 2px 1px rgb(255 255 255 / 0.1), inset 0 -4px 10px rgb(0 0 0 / 0.6), 0 20px 40px -12px rgb(0 0 0 / 0.85)',
          }}
        >
          <div className="absolute inset-[7%] rounded-full border border-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]" />
          <div className="absolute inset-[19%] rounded-full border border-black/40 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />

          {/* Bolts around the rim: they slide in when the code is right */}
          {BOLTS.map((angle, i) => {
            const radius = unlocked ? 39 : 43.5
            return (
              <motion.span
                key={i}
                className="absolute size-[5.5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: ROSE_GOLD, boxShadow: '0 2px 3px rgb(0 0 0 / 0.6), inset 0 1px 0 rgb(255 255 255 / 0.5)' }}
                initial={false}
                animate={{ left: `${50 + radius * Math.sin(angle)}%`, top: `${50 - radius * Math.cos(angle)}%`, scale: unlocked ? 0.75 : 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: unlocked ? i * 0.025 : 0 }}
              />
            )
          })}

          {/* Handle spokes */}
          <motion.div className="absolute inset-0" initial={false} animate={{ rotate: unlocked ? 90 : 0 }} transition={{ duration: 0.9, ease: EASE }}>
            {[0, 120, 240].map((angle) => (
              <span key={angle} className="absolute top-1/2 left-1/2 h-[29%] w-[5%] origin-top -translate-x-1/2" style={{ rotate: `${angle}deg` }}>
                <span className="absolute inset-x-[22%] top-0 bottom-[16%] rounded-full" style={{ background: ROSE_GOLD }} />
                <span className="absolute bottom-0 left-1/2 aspect-square w-[150%] -translate-x-1/2 rounded-full" style={{ background: ROSE_GOLD, boxShadow: '0 3px 6px rgb(0 0 0 / 0.5)' }} />
              </span>
            ))}
          </motion.div>

          {/* Combination dial */}
          <motion.div
            className="absolute inset-[31%] rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 28%, #57504a, #26221f 70%)',
              boxShadow: '0 8px 18px -4px rgb(0 0 0 / 0.8), inset 0 1px 0 rgb(255 255 255 / 0.15)',
            }}
            initial={false}
            animate={{ rotate: dial + (unlocked ? 720 : 0) }}
            transition={{ type: 'spring', stiffness: unlocked ? 22 : 70, damping: unlocked ? 9 : 14 }}
          >
            <div
              className="absolute inset-[4%] rounded-full"
              style={{
                background: 'repeating-conic-gradient(rgb(255 236 226 / 0.55) 0deg 0.9deg, transparent 0.9deg 9deg)',
                WebkitMaskImage: 'radial-gradient(circle closest-side, transparent 80%, #000 82%, #000 96%, transparent 98%)',
                maskImage: 'radial-gradient(circle closest-side, transparent 80%, #000 82%, #000 96%, transparent 98%)',
              }}
            />
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="absolute inset-0" style={{ rotate: `${n * 36}deg` }}>
                <span className="absolute top-[14%] left-1/2 -translate-x-1/2 font-mono text-[3.2cqw] font-semibold text-[#f3d7cc]/85">{n}</span>
              </span>
            ))}
          </motion.div>

          {/* Fixed index marker above the dial */}
          <span className="absolute top-[29%] left-1/2 h-[3%] w-[1.2%] -translate-x-1/2 rounded-full bg-rose shadow-[0_0_8px_rgb(255_111_145)]" />

          {/* Centre cap */}
          <div
            className="absolute inset-[43%] grid place-items-center rounded-full text-[#5a2b2b]"
            style={{ background: ROSE_GOLD, boxShadow: '0 4px 10px rgb(0 0 0 / 0.6), inset 0 1px 0 rgb(255 255 255 / 0.6)' }}
          >
            {unlocked ? <Heart className="size-[45%] fill-current" /> : <Lock className="size-[42%]" />}
          </div>

          {/* Status light */}
          <span
            className="absolute top-[11%] left-1/2 size-[2.6%] -translate-x-1/2 rounded-full transition-colors duration-300"
            style={{ background: led, boxShadow: `0 0 12px ${led}, 0 0 4px ${led}` }}
          />
        </div>
      </motion.div>
    </div>
  )
}
