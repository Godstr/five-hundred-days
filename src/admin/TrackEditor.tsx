import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ChevronDown, Music, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { MOOD_COLORS } from '../components/tracklist/moodColors'
import type { Mood, Track } from '../config/story'
import { tx } from '../i18n'
import { cn } from '../lib/dom'
import { preview } from './api'
import { BiField, inputClass, Label, MediaField } from './fields'

/* Local date math: importing lib/time would pull the story file into this page,
   and Vite would then reload the editor on every save. */
const pad2 = (n: number) => String(n).padStart(2, '0')
function dayNumber(start: string, date: string): number {
  const utc = (value: string) => {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(date) - utc(start)) / 86_400_000)
}

const MOODS: { value: Mood; label: string }[] = [
  { value: 'dawn', label: 'Dawn · sunrise & birds' },
  { value: 'road', label: 'Road trip · steppe road' },
  { value: 'night', label: 'Night · moon & melody' },
  { value: 'stage', label: 'Stage · spotlights & mic' },
  { value: 'snow', label: 'Snow · ger in winter' },
  { value: 'code', label: 'Code · pixel heart' },
  { value: 'golden', label: 'Golden hour · big sun' },
  { value: 'encore', label: 'Encore · confetti' },
]

interface TrackEditorProps {
  track: Track
  index: number
  count: number
  /** The story's start date, for the "Day N" stamp. */
  startDate: string
  open: boolean
  onToggle: () => void
  onChange: (track: Track) => void
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
}

/** One memory: collapsed to a row, expanded to the full form. */
export function TrackEditor({ track, index, count, startDate, open, onToggle, onChange, onMove, onDelete }: TrackEditorProps) {
  const set = <K extends keyof Track>(key: K, value: Track[K]) => {
    const next = { ...track, [key]: value }
    if (value === undefined) delete next[key]
    onChange(next)
  }
  const [, mid, light] = MOOD_COLORS[track.mood]

  return (
    <li className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]">
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="font-mono text-xs text-dust">{pad2(index + 1)}</span>
          <span
            className="size-11 shrink-0 overflow-hidden rounded-lg"
            style={{ background: `linear-gradient(135deg, ${mid}, ${light})` }}
          >
            {track.photo && <img src={preview(track.photo)} alt="" className="size-full object-cover" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-cream">{tx(track.title, 'en') || 'Untitled memory'}</span>
            <span className="block truncate text-xs text-dust">
              {track.date} · Day {dayNumber(startDate, track.date)} {track.audio && <Music className="ml-1 inline size-3 text-rose" />}
            </span>
          </span>
          <ChevronDown className={cn('ml-auto size-4 shrink-0 text-dust transition-transform', open && 'rotate-180')} />
        </button>
        <div className="flex shrink-0 items-center">
          <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
            <ArrowDown className="size-4" />
          </IconButton>
          <IconButton label="Delete memory" danger onClick={onDelete}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-5 border-t border-white/8 p-4 md:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <MediaField kind="memories" label="Photo" hint="resized to 1600px" value={track.photo} onChange={(v) => set('photo', v)} />
                <MediaField
                  kind="audio"
                  label="Song or voice note"
                  hint="empty = generated music"
                  value={track.audio}
                  onChange={(v) => set('audio', v)}
                />
              </div>

              <BiField label="Title" value={track.title} onChange={(v) => set('title', v ?? '')} />
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.4fr]">
                <div>
                  <Label>Date</Label>
                  <input type="date" value={track.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <Label hint="artwork + music when there's no photo / audio">Mood</Label>
                  <select value={track.mood} onChange={(e) => set('mood', e.target.value as Mood)} className={cn(inputClass, 'appearance-auto')}>
                    {MOODS.map((mood) => (
                      <option key={mood.value} value={mood.value} className="bg-coal">
                        {mood.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <BiField label="Place" value={track.place} onChange={(v) => set('place', v ?? '')} />
              <BiField label="The note" hint="the main memory text" value={track.note} onChange={(v) => set('note', v ?? '')} multiline rows={4} />
              <BiField label="Polaroid caption" hint="handwritten, keep it short" value={track.caption} onChange={(v) => set('caption', v ?? '')} />
              <BiField label="Back of the polaroid" hint="optional" value={track.ps} onChange={(v) => set('ps', v)} multiline rows={2} />
              <div className="grid gap-4 md:grid-cols-2">
                <BiField label="Badge" hint="optional, e.g. Intro" value={track.tag} onChange={(v) => set('tag', v)} />
                <BiField label="Player label" hint="optional" value={track.audioLabel} onChange={(v) => set('audioLabel', v)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-8 place-items-center rounded-full text-dust transition-colors hover:bg-white/5 disabled:opacity-25',
        danger ? 'hover:text-red-300' : 'hover:text-cream',
      )}
    >
      {children}
    </button>
  )
}
