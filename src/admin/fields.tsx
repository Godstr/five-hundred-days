import { ImagePlus, LoaderCircle, Music, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import type { L } from '../i18n'
import { cn } from '../lib/dom'
import { preview, shrinkPhoto, upload, type UploadKind } from './api'

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-cream outline-none transition-colors placeholder:text-dust/60 focus:border-rose/60 focus:bg-white/[0.06]'

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] tracking-[0.18em] text-sand uppercase">{children}</span>
      {hint && <span className="text-[11px] text-dust">{hint}</span>}
    </span>
  )
}

const split = (value: L | undefined) =>
  value === undefined ? { en: '', mn: '' } : typeof value === 'string' ? { en: value, mn: value } : value

/** One field, two languages side by side. Empty in both → undefined, so optional fields disappear. */
export function BiField({
  label,
  hint,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string
  hint?: string
  value: L | undefined
  onChange: (value: L | undefined) => void
  multiline?: boolean
  rows?: number
}) {
  const both = split(value)
  const set = (lang: 'en' | 'mn', text: string) => {
    const next = { ...both, [lang]: text }
    onChange(!next.en && !next.mn ? undefined : next)
  }
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className="grid gap-2 md:grid-cols-2">
        {(['en', 'mn'] as const).map((lang) => (
          <label key={lang} className="relative block">
            <span className="pointer-events-none absolute top-2 right-2.5 font-mono text-[9px] tracking-widest text-dust">
              {lang === 'en' ? 'EN' : 'МН'}
            </span>
            {multiline ? (
              <textarea rows={rows} value={both[lang]} onChange={(e) => set(lang, e.target.value)} className={cn(inputClass, 'resize-y pr-9')} />
            ) : (
              <input value={both[lang]} onChange={(e) => set(lang, e.target.value)} className={cn(inputClass, 'pr-9')} />
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

/** Upload (button or drag & drop), preview and remove a photo or an audio file. */
export function MediaField({
  kind,
  label,
  hint,
  value,
  onChange,
}: {
  kind: UploadKind
  label: string
  hint?: string
  value: string | undefined
  onChange: (path: string | undefined) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const photo = kind === 'memories'

  const take = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const { blob, name } = photo ? await shrinkPhoto(file) : { blob: file, name: file.name }
      onChange(await upload(kind, name, blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    void take(event.dataTransfer.files[0])
  }

  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-dashed p-3 transition-colors',
          dragging ? 'border-rose bg-rose/10' : 'border-white/15 bg-white/[0.02]',
        )}
      >
        {photo ? (
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
            {value ? <img src={preview(value)} alt="" className="size-full object-cover" /> : <ImagePlus className="size-5 text-dust" />}
          </div>
        ) : (
          !value && (
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5">
              <Music className="size-4 text-dust" />
            </div>
          )
        )}

        <div className="min-w-0 flex-1">
          {!photo && value && <audio controls src={preview(value)} className="h-9 w-full" />}
          <p className="mt-1 truncate font-mono text-[11px] text-dust">
            {value ?? (photo ? 'Drop a photo here, or upload one' : 'Drop an mp3 / m4a here, or upload one')}
          </p>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label="Remove"
              className="grid size-8 place-items-center rounded-full text-dust transition-colors hover:bg-white/5 hover:text-red-300"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          hidden
          accept={photo ? 'image/jpeg,image/png,image/webp,image/gif,image/avif' : 'audio/*,.mp3,.m4a,.aac,.wav,.ogg'}
          onChange={(e) => {
            void take(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
