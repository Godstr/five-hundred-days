import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'
import type { CodeStatus } from './VaultDoor'

const KEYS: [string, string][] = [
  ['1', ''],
  ['2', 'abc'],
  ['3', 'def'],
  ['4', 'ghi'],
  ['5', 'jkl'],
  ['6', 'mno'],
  ['7', 'pqrs'],
  ['8', 'tuv'],
  ['9', 'wxyz'],
]

interface KeypadProps {
  length: number
  value: string
  status: CodeStatus
  onDigit: (digit: string) => void
  onDelete: () => void
}

/** An iPhone-style passcode pad: glass keys, filling dots, a shake when it's wrong. */
export function Keypad({ length, value, status, onDigit, onDelete }: KeypadProps) {
  const { t } = useI18n()
  return (
    <div>
      <motion.div
        className="flex justify-center gap-3.5"
        animate={status === 'error' ? { x: [0, -14, 14, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        aria-live="polite"
        aria-label={t('keypad.progress', { n: value.length, m: length })}
      >
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-3.5 rounded-full border transition-all duration-200',
              i >= value.length && 'border-white/35',
              i < value.length && status === 'idle' && 'scale-110 border-rose bg-rose shadow-[0_0_12px_rgb(255_111_145/0.8)]',
              i < value.length && status === 'error' && 'border-red-400 bg-red-400',
              i < value.length && status === 'success' && 'border-emerald-300 bg-emerald-300 shadow-[0_0_14px_rgb(110_231_183/0.9)]',
            )}
          />
        ))}
      </motion.div>

      <div className="mx-auto mt-9 grid w-fit grid-cols-3 gap-x-6 gap-y-4">
        {KEYS.map(([digit, letters]) => (
          <Key key={digit} digit={digit} letters={letters} onPress={onDigit} />
        ))}
        <span />
        <Key digit="0" onPress={onDigit} />
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={onDelete}
          aria-label={t('keypad.delete')}
          className="grid size-[4.6rem] place-items-center rounded-full text-sand transition-colors hover:text-cream"
        >
          <Delete className="size-6" />
        </motion.button>
      </div>
    </div>
  )
}

function Key({ digit, letters, onPress }: { digit: string; letters?: string; onPress: (digit: string) => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={() => onPress(digit)}
      className="glass grid size-[4.6rem] place-items-center rounded-full text-cream transition-colors active:bg-white/25"
    >
      <span className="flex flex-col items-center leading-none">
        <span className="text-[1.95rem] font-light">{digit}</span>
        {letters && <span className="mt-0.5 font-mono text-[8px] font-semibold tracking-[0.22em] text-sand uppercase">{letters}</span>}
      </span>
    </motion.button>
  )
}
