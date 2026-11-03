import type { Mood } from '../config/story'
import type { Theme } from './synth'

/* Chord shapes written in C and transposed by each theme's root:
   [bass, ...voicing] in semitones from the tonic, voiced around middle C. */
const I = [0, -1, 2, 4, 7] //   Cmaj9: B D E G over C
const ii = [2, -7, -3, 0, 4] //  Dm9:   F A C E over D
const iii = [4, -5, -1, 2, 4] // Em7:   G B D E over E
const IV = [5, -3, 0, 4, 7] //   Fmaj9: A C E G over F
const iv = [5, -4, 0, 2, 5] //   Fm6:   Ab C D F over F (the bittersweet one)
const V = [7, -7, -3, 0, 2] //   G9sus: F A C D over G
const vi = [9, 0, 4, 7, 11] //   Am9:   C E G B over A

const song = {
  barsPerChord: 1,
  cycles: 3,
  density: 0.45,
  groove: 'none',
  crackle: 0.35,
  brightness: 1,
  loop: false,
} as const

/** The record in the hero: a slow, looping, heartbeat-under-the-music piece. */
export const SIDE_A: Theme = {
  bpm: 68,
  root: 57,
  progression: [IV, iii, ii, I],
  barsPerChord: 2,
  cycles: 2,
  lead: 'bell',
  density: 0.32,
  groove: 'heartbeat',
  crackle: 0.6,
  brightness: 0.9,
  loop: true,
  seed: 500,
}

/** One instrumental per mood. */
export const THEMES: Record<Mood, Theme> = {
  dawn: { ...song, bpm: 76, root: 60, progression: [I, V, vi, IV], lead: 'musicbox', density: 0.5, seed: 1 },
  road: { ...song, bpm: 92, root: 62, progression: [I, vi, IV, V], lead: 'bell', density: 0.55, groove: 'soft', brightness: 1.15, seed: 2 },
  night: { ...song, bpm: 64, root: 57, progression: [vi, iii, IV, I], lead: 'bell', density: 0.3, crackle: 0.7, brightness: 0.75, seed: 3 },
  stage: { ...song, bpm: 80, root: 63, progression: [IV, V, iii, vi], lead: 'voice', density: 0.6, seed: 4 },
  snow: { ...song, bpm: 70, root: 64, progression: [I, vi, ii, V], lead: 'musicbox', density: 0.6, crackle: 0.25, brightness: 1.2, seed: 5 },
  code: { ...song, bpm: 88, root: 58, progression: [ii, V, I, vi], lead: 'chip', density: 0.55, groove: 'soft', seed: 6 },
  golden: { ...song, bpm: 72, root: 62, progression: [IV, iv, I, vi], lead: 'voice', density: 0.5, crackle: 0.45, seed: 7 },
  encore: { ...song, bpm: 78, root: 60, progression: [vi, IV, I, V], lead: 'voice', density: 0.55, groove: 'heartbeat', brightness: 1.1, seed: 8 },
}
