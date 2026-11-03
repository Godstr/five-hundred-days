import { Check, ExternalLink, LoaderCircle, Plus, Save, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { L } from '../i18n'
import type { StoryConfig, Track } from '../config/story'
import { cn } from '../lib/dom'
import { loadStory, saveStory } from './api'
import { BiField, inputClass, Label, MediaField } from './fields'
import { TrackEditor } from './TrackEditor'

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'error'

/** Paragraph arrays ⇄ one textarea with blank lines between paragraphs. */
const joinParagraphs = (value: L<string[]>): L =>
  Array.isArray(value) ? value.join('\n\n') : { en: value.en.join('\n\n'), mn: value.mn.join('\n\n') }
const splitParagraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

function newTrack(): Track {
  return {
    id: `memory-${Date.now().toString(36)}`,
    title: { en: 'New memory', mn: 'Шинэ дурсамж' },
    date: new Date().toISOString().slice(0, 10),
    place: { en: '', mn: '' },
    note: { en: '', mn: '' },
    caption: { en: '', mn: '' },
    mood: 'dawn',
  }
}

/**
 * The local editor at http://localhost:5173/#admin (dev server only).
 * Edits src/content/story.json and uploads photos / audio into public/.
 */
export default function Admin() {
  const [story, setStory] = useState<StoryConfig | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Admin · Five Hundred Days'
    loadStory()
      .then((s) => {
        setStory(s)
        setSavedJson(JSON.stringify(s))
        setStatus('ready')
      })
      .catch((e) => {
        setError(e.message)
        setStatus('error')
      })
  }, [])

  const dirty = !!story && JSON.stringify(story) !== savedJson

  const save = useCallback(async () => {
    if (!story) return
    setStatus('saving')
    setError('')
    try {
      await saveStory(story)
      setSavedJson(JSON.stringify(story))
      setStatus('saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }, [story])

  // Ctrl/Cmd + S saves; leaving with unsaved changes asks first
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void save()
      }
    }
    const onLeave = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [save, dirty])

  if (!story) {
    return (
      <Shell>
        <div className="grid min-h-[60vh] place-items-center text-sand">
          {status === 'error' ? (
            <p className="max-w-md text-center text-red-300">
              Couldn’t load the story: {error}. The admin only works under <code>npm run dev</code>.
            </p>
          ) : (
            <LoaderCircle className="size-6 animate-spin" />
          )}
        </div>
      </Shell>
    )
  }

  const update = (change: (draft: StoryConfig) => void) => {
    setStory((current) => {
      const draft = structuredClone(current!)
      change(draft)
      return draft
    })
    setStatus('ready')
  }
  const setTrack = (index: number, track: Track) => update((d) => void (d.tracks[index] = track))
  const moveTrack = (index: number, direction: -1 | 1) =>
    update((d) => {
      const [track] = d.tracks.splice(index, 1)
      d.tracks.splice(index + direction, 0, track)
    })
  const deleteTrack = (index: number) => {
    const title = typeof story.tracks[index].title === 'string' ? story.tracks[index].title : story.tracks[index].title.en
    if (window.confirm(`Delete “${title}”? Its photo and audio files stay in the project.`)) update((d) => void d.tracks.splice(index, 1))
  }
  const addTrack = () => {
    const track = newTrack()
    update((d) => void d.tracks.push(track))
    setOpenId(track.id)
  }

  return (
    <Shell>
      <header className="sticky top-0 z-20 -mx-4 mb-8 border-b border-white/8 bg-ink/85 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] tracking-[0.24em] text-amber uppercase">Admin · only on this computer</p>
            <h1 className="truncate font-display text-2xl italic">Five Hundred Days</h1>
          </div>
          <SaveState status={status} dirty={dirty} error={error} />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-sand hover:text-cream sm:inline-flex"
          >
            Open site <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || status === 'saving'}
            className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
          >
            {status === 'saving' ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        <Card title="Memories" description="The tracklist. Each memory can have its own photo and song or voice note.">
          <ol className="grid gap-3">
            {story.tracks.map((track, index) => (
              <TrackEditor
                key={track.id}
                track={track}
                index={index}
                count={story.tracks.length}
                startDate={story.startDate}
                open={openId === track.id}
                onToggle={() => setOpenId(openId === track.id ? null : track.id)}
                onChange={(t) => setTrack(index, t)}
                onMove={(direction) => moveTrack(index, direction)}
                onDelete={() => deleteTrack(index)}
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={addTrack}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-sm text-sand transition-colors hover:border-rose/50 hover:text-cream"
          >
            <Plus className="size-4" /> Add a memory
          </button>
        </Card>

        <Card title="Side A" description="The song on the big record at the top of the site.">
          <div className="grid gap-4">
            <BiField label="Song title" value={story.music.title} onChange={(v) => update((d) => void (d.music.title = v ?? ''))} />
            <MediaField kind="audio" label="Audio file" value={story.music.src || undefined} onChange={(v) => update((d) => void (d.music.src = v ?? ''))} />
            <MediaField
              kind="audio"
              label="Voice note under the record"
              hint="optional: shows a button when set"
              value={story.voiceNote.src || undefined}
              onChange={(v) => update((d) => void (d.voiceNote.src = v ?? ''))}
            />
          </div>
        </Card>

        <Card title="The basics">
          <div className="grid gap-4">
            <BiField label="Her name" value={story.her.name} onChange={(v) => update((d) => void (d.her.name = v ?? ''))} />
            <BiField
              label="Her name, “for her”"
              hint="МН needs the -д / -т ending: Баяржаргалд"
              value={story.her.nameTo}
              onChange={(v) => update((d) => void (d.her.nameTo = v ?? ''))}
            />
            <BiField label="Your name" value={story.me.name} onChange={(v) => update((d) => void (d.me.name = v ?? ''))} />
            <div>
              <Label hint="the counter counts from here">Start date</Label>
              <input
                type="datetime-local"
                value={story.startDate}
                onChange={(e) => update((d) => void (d.startDate = e.target.value))}
                className={cn(inputClass, 'max-w-xs [color-scheme:dark]')}
              />
            </div>
          </div>
        </Card>

        <Card title="The letter" description="Inside the vault. Separate paragraphs with an empty line.">
          <div className="grid gap-4">
            <BiField label="Greeting" value={story.letter.greeting} onChange={(v) => update((d) => void (d.letter.greeting = v ?? ''))} />
            <BiField
              label="Letter"
              value={joinParagraphs(story.letter.body)}
              multiline
              rows={8}
              onChange={(v) =>
                update((d) => {
                  const text = typeof v === 'object' ? v : { en: v ?? '', mn: v ?? '' }
                  d.letter.body = { en: splitParagraphs(text.en), mn: splitParagraphs(text.mn) }
                })
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <BiField label="Closing" value={story.letter.closing} onChange={(v) => update((d) => void (d.letter.closing = v ?? ''))} />
              <BiField label="Signature" value={story.letter.signature} onChange={(v) => update((d) => void (d.letter.signature = v ?? ''))} />
            </div>
          </div>
        </Card>

        <Card title="The vault">
          <div className="grid gap-4">
            <div>
              <Label hint="digits only">Code</Label>
              <input
                inputMode="numeric"
                value={story.vault.code}
                onChange={(e) => update((d) => void (d.vault.code = e.target.value.replace(/\D/g, '').slice(0, 10)))}
                className={cn(inputClass, 'max-w-xs font-mono tracking-[0.3em]')}
              />
            </div>
            <BiField label="Hint" value={story.vault.hint} onChange={(v) => update((d) => void (d.vault.hint = v ?? ''))} />
            <BiField
              label="Extra hint"
              hint="after 3 wrong tries"
              value={story.vault.rescueHint}
              onChange={(v) => update((d) => void (d.vault.rescueHint = v ?? ''))}
            />
          </div>
        </Card>

        <Card title="Liner notes" description="The paragraph that lights up as she scrolls. Wrap words in *stars* to make them glow.">
          <BiField label="Text" value={story.linerNotes} multiline rows={5} onChange={(v) => update((d) => void (d.linerNotes = v ?? ''))} />
        </Card>

        <p className="pb-16 text-center font-mono text-[11px] text-dust">
          Saved changes show up on the site right away. Run <code className="text-sand">npm run build</code> to publish them.
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh max-w-4xl px-4 md:px-8">{children}</div>
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/8 bg-coal/70 p-4 md:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-dust">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function SaveState({ status, dirty, error }: { status: Status; dirty: boolean; error: string }) {
  if (status === 'error') {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-red-300 md:inline-flex" title={error}>
        <TriangleAlert className="size-3.5" /> Not saved
      </span>
    )
  }
  if (dirty) return <span className="hidden text-xs text-amber md:inline">Unsaved changes</span>
  if (status === 'saved') {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-emerald-300 md:inline-flex">
        <Check className="size-3.5" /> Saved
      </span>
    )
  }
  return null
}
