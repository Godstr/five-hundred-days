import type { Mood } from '../../config/story'

/** Three colours per mood: deep, mid, light. Also used to tint the memory sheet. */
export const MOOD_COLORS: Record<Mood, [string, string, string]> = {
  dawn: ['#2b1b3d', '#ff8e72', '#ffd9a8'],
  road: ['#1b1f3a', '#7a3b63', '#f4a26b'],
  night: ['#070a1f', '#251b4d', '#a596ff'],
  stage: ['#12060f', '#4a0f2c', '#ff6f91'],
  snow: ['#0e1b2e', '#46658a', '#d6e2f0'],
  code: ['#060d0b', '#0f2a22', '#5df2b0'],
  golden: ['#2a120a', '#d8692f', '#ffd38a'],
  encore: ['#1a0920', '#7d1f4f', '#ff8fb0'],
}
