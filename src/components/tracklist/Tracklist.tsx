import { motion } from 'framer-motion'
import { Play, Shuffle } from 'lucide-react'
import { engine, usePlayer } from '../../audio'
import { story } from '../../config/story'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/dom'
import { EASE, reveal } from '../../lib/motion'
import { ui } from '../../lib/store'
import { dayOf, formatDate, pad2, parseLocal, spellNumber, START } from '../../lib/time'
import { Equalizer } from '../player/Equalizer'
import { SectionHeading } from '../ui/SectionHeading'
import { AlbumSleeve } from './AlbumSleeve'

const TRACK_IDS = new Set(story.tracks.map((t) => t.id))

/** Opening a memory also plays its song, like tapping a track in a music app. */
function openTrack(id: string) {
  engine.play(id)
  ui.set({ sheetId: id })
}

export function Tracklist() {
  const { currentId, status } = usePlayer()
  const { lang, t, tx } = useI18n()
  const albumPlaying = !!currentId && TRACK_IDS.has(currentId) && status === 'playing'
  const last = story.tracks[story.tracks.length - 1]

  const shuffle = () => {
    const others = story.tracks.filter((t) => t.id !== currentId)
    openTrack(others[Math.floor(Math.random() * others.length)].id)
  }

  return (
    <section id="tracklist" className="relative z-10 px-5 py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02"
          kicker={t('tracklist.kicker')}
          title={t('tracklist.title')}
          accent={t('tracklist.accent', { n: lang === 'en' ? spellNumber(story.tracks.length) : story.tracks.length })}
        />

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-20">
          <motion.div {...reveal} className="lg:sticky lg:top-28 lg:self-start">
            <AlbumSleeve spinning={albumPlaying} />
            <div className="mt-8 text-center lg:text-left">
              <p className="eyebrow">{t('album.label')} · {START.getFullYear()}–{parseLocal(last.date).getFullYear()}</p>
              <p className="mt-2 font-display text-3xl italic">
                {tx(story.album.title)} <span className="text-dust">({tx(story.album.edition)})</span>
              </p>
              <p className="mt-1 text-sm text-sand">
                {t('album.meta', { artist: tx(story.album.artist), n: story.tracks.length, days: dayOf(last.date) })}
              </p>
              <div className="mt-5 flex justify-center gap-3 lg:justify-start">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openTrack(story.tracks[0].id)}
                  className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  <Play className="size-4 fill-current" /> {t('album.play')}
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={shuffle}
                  aria-label={t('album.shuffle')}
                  className="glass grid size-10 place-items-center rounded-full text-cream"
                >
                  <Shuffle className="size-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <ol className="border-t border-white/8">
            {story.tracks.map((track, i) => {
              const current = currentId === track.id
              const playing = current && (status === 'playing' || status === 'loading')
              return (
                <motion.li
                  key={track.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, ease: EASE, delay: (i % 4) * 0.06 }}
                  className="border-b border-white/8"
                >
                  <button
                    type="button"
                    onClick={() => openTrack(track.id)}
                    onPointerEnter={() => engine.prefetch(track.id)}
                    className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-2xl px-2 py-4 text-left transition-colors hover:bg-white/[0.04] md:grid-cols-[3rem_1fr_auto] md:px-4 md:py-5"
                  >
                    <span className="relative grid h-6 place-items-center font-mono text-sm text-dust">
                      {playing ? (
                        <Equalizer active={status === 'playing'} className="text-rose" />
                      ) : (
                        <>
                          <span className="transition-opacity group-hover:opacity-0">{pad2(i + 1)}</span>
                          <Play className="absolute size-4 fill-cream text-cream opacity-0 transition-opacity group-hover:opacity-100" />
                        </>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className={cn('flex items-center gap-2 text-[17px] font-medium md:text-xl', current ? 'text-rose' : 'text-cream')}>
                        <span className="truncate">{tx(track.title)}</span>
                        {track.tag && (
                          <span className="shrink-0 rounded-md border border-white/12 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.16em] text-sand uppercase">
                            {tx(track.tag)}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-[13px] text-dust">
                        {formatDate(track.date, 'short')} · {tx(track.place)}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-dust tabular-nums">{t('day', { n: dayOf(track.date) })}</span>
                  </button>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
