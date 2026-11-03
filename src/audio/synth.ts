/**
 * A tiny generative composer.
 *
 * Every memory gets its own instrumental: a chord progression, a seeded random
 * melody, a warm pad, a Rhodes-style electric piano, bass, an optional groove
 * and a little vinyl crackle. It is rendered offline with the Web Audio API and
 * encoded as a WAV, so it plays through a plain <audio> element. Unlike live
 * Web Audio, <audio> keeps playing when an iPhone's silent switch is on.
 */
import { mulberry32 } from '../lib/random'
import { encodeWav } from './wav'

export type Lead = 'bell' | 'musicbox' | 'voice' | 'chip'
export type Groove = 'none' | 'heartbeat' | 'soft'

export interface Theme {
  bpm: number
  /** MIDI note of the tonic around middle C (55–64 sounds best). */
  root: number
  /** Chords as [bass, ...voicing], in semitones from the tonic. */
  progression: number[][]
  barsPerChord: 1 | 2
  cycles: number
  lead: Lead
  /** 0–1, how busy the melody is. */
  density: number
  groove: Groove
  /** 0–1 vinyl crackle. */
  crackle: number
  /** Low-pass multiplier: below 1 is darker, above 1 brighter. */
  brightness: number
  /** Seamless loop (background music) or a song with an ending. */
  loop: boolean
  seed: number
}

export interface RenderedTheme {
  url: string
  duration: number
  /** Loudness 0–1, ENVELOPE_RATE samples per second. Drives the visuals. */
  envelope: Float32Array
}

export const ENVELOPE_RATE = 30

const TAIL = 4.5
const PENTATONIC = [0, 2, 4, 7, 9]
/** Melody range per lead, in semitones above the tonic. */
const RANGE: Record<Lead, [number, number]> = {
  bell: [12, 28],
  musicbox: [16, 33],
  chip: [12, 28],
  voice: [0, 19],
}
/** Rhythms for the sung-style lead: [start beat, length in beats]. */
const PHRASES = [
  [[0, 2], [2, 2]],
  [[0, 1.5], [1.5, 0.5], [2, 2]],
  [[0, 3], [3, 1]],
  [[0.5, 1.5], [2, 1], [3, 1]],
  [[0, 1], [1, 1], [2, 2]],
]

const mtof = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

function createContext(seconds: number): OfflineAudioContext {
  const Ctor =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext
  // 32 kHz is plenty for soft keys and pads and keeps the WAV small. Fall back if a browser refuses it.
  for (const rate of [32000, 44100]) {
    try {
      return new Ctor(2, Math.ceil(seconds * rate), rate)
    } catch {
      /* try the next rate */
    }
  }
  throw new Error('OfflineAudioContext is not available')
}

/** A stereo reverb impulse: decaying noise that darkens as it fades. */
function impulse(ctx: BaseAudioContext, seconds: number, rand: () => number): AudioBuffer {
  const sr = ctx.sampleRate
  const length = Math.floor(seconds * sr)
  const pre = Math.floor(0.02 * sr)
  const buffer = ctx.createBuffer(2, length, sr)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    let lp = 0
    for (let i = pre; i < length; i++) {
      const x = (i - pre) / (length - pre)
      lp += (rand() * 2 - 1 - lp) * (0.7 - 0.55 * x)
      data[i] = lp * (1 - x) ** 2.8
    }
  }
  return buffer
}

export async function renderTheme(theme: Theme): Promise<RenderedTheme> {
  const beat = 60 / theme.bpm
  const bar = beat * 4
  const chordLength = bar * theme.barsPerChord
  const chords = Array.from(
    { length: theme.progression.length * theme.cycles },
    (_, i) => theme.progression[i % theme.progression.length],
  )
  const body = chords.length * chordLength
  const total = body + (theme.loop ? 0 : bar * 2) + TAIL

  const ctx = createContext(total)
  const sr = ctx.sampleRate
  const rand = mulberry32(theme.seed)
  const human = () => (rand() - 0.5) * 0.018
  const R = theme.root

  /* ── Mix: dry → master, sends → reverb and a tape-ish delay ── */
  const master = ctx.createGain()
  master.gain.value = 0.9
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.knee.value = 14
  comp.ratio.value = 3
  comp.attack.value = 0.015
  comp.release.value = 0.35
  master.connect(comp).connect(ctx.destination)

  const reverbIn = ctx.createGain()
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 3.6, rand)
  const reverbOut = ctx.createGain()
  reverbOut.gain.value = 0.6
  reverbIn.connect(reverb).connect(reverbOut).connect(master)

  const delayIn = ctx.createGain()
  const delay = ctx.createDelay(2)
  delay.delayTime.value = beat * 0.75
  const delayTone = ctx.createBiquadFilter()
  delayTone.type = 'lowpass'
  delayTone.frequency.value = 2400
  const feedback = ctx.createGain()
  feedback.gain.value = 0.35
  delayIn.connect(delay).connect(delayTone).connect(feedback).connect(delay)
  const delayOut = ctx.createGain()
  delayOut.gain.value = 0.45
  delayTone.connect(delayOut)
  delayOut.connect(master)
  delayOut.connect(reverbIn)

  const bus = (dry: number, wet: number, echo = 0) => {
    const input = ctx.createGain()
    const send = (amount: number, target: AudioNode) => {
      const gain = ctx.createGain()
      gain.gain.value = amount
      input.connect(gain).connect(target)
    }
    send(dry, master)
    if (wet) send(wet, reverbIn)
    if (echo) send(echo, delayIn)
    return input
  }
  const padBus = bus(0.55, 0.9)
  const keysBus = bus(0.7, 0.4, 0.1)
  const leadBus = bus(0.45, 0.65, 0.42)
  const bassBus = bus(0.8, 0.06)
  const drumBus = bus(0.7, 0.08)

  // Slow tremolo on the keys, like an old suitcase Rhodes
  const tremolo = ctx.createOscillator()
  tremolo.frequency.value = 4.3
  const tremoloDepth = ctx.createGain()
  tremoloDepth.gain.value = 0.12
  tremolo.connect(tremoloDepth).connect(keysBus.gain)
  tremolo.start(0)
  tremolo.stop(total)

  /* ── Instruments ── */

  function pad(notes: number[], t: number, length: number) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 0.5
    const cutoff = 950 * theme.brightness
    filter.frequency.setValueAtTime(cutoff * 0.55, t)
    filter.frequency.linearRampToValueAtTime(cutoff, t + length * 0.6)
    filter.frequency.linearRampToValueAtTime(cutoff * 0.6, t + length + 2)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.03, t + Math.min(1.6, length * 0.45))
    env.gain.setValueAtTime(0.03, t + length)
    env.gain.linearRampToValueAtTime(0, t + length + 2)
    filter.connect(env).connect(padBus)

    const left = ctx.createStereoPanner()
    left.pan.value = -0.45
    left.connect(filter)
    const right = ctx.createStereoPanner()
    right.pan.value = 0.45
    right.connect(filter)
    for (const note of notes) {
      for (const [detune, side] of [[-8, left], [8, right]] as const) {
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = mtof(R + note)
        osc.detune.value = detune + (rand() - 0.5) * 6
        osc.connect(side)
        osc.start(t)
        osc.stop(t + length + 2.05)
      }
    }
  }

  /** Two-operator FM electric piano. */
  function keys(midi: number, t: number, velocity: number) {
    const f = mtof(midi)
    const carrier = ctx.createOscillator()
    carrier.frequency.value = f
    const modulator = ctx.createOscillator()
    modulator.frequency.value = f
    const index = ctx.createGain()
    index.gain.setValueAtTime(f * (0.9 + velocity * 1.4), t)
    index.gain.exponentialRampToValueAtTime(f * 0.12, t + 1.4)
    modulator.connect(index).connect(carrier.frequency)

    const decay = Math.max(1.4, 3.2 - (midi - 52) * 0.05)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(0.1 * velocity, t + 0.006)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    const pan = ctx.createStereoPanner()
    pan.pan.value = (rand() - 0.5) * 0.5
    carrier.connect(amp).connect(pan).connect(keysBus)
    for (const osc of [carrier, modulator]) {
      osc.start(t)
      osc.stop(t + decay + 0.05)
    }
  }

  function bell(midi: number, t: number, velocity: number) {
    const f = mtof(midi)
    const musicBox = theme.lead === 'musicbox'
    const partials = musicBox
      ? [[1, 1], [3, 0.16], [5.4, 0.05]]
      : [[1, 1], [2, 0.22], [4.02, 0.06]]
    const decay = musicBox ? 1.5 : 2.6
    const pan = ctx.createStereoPanner()
    pan.pan.value = (rand() - 0.5) * 0.7
    pan.connect(leadBus)
    for (const [ratio, level] of partials) {
      const osc = ctx.createOscillator()
      osc.frequency.value = f * ratio
      const gain = ctx.createGain()
      const d = decay / Math.sqrt(ratio)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.075 * velocity * level, t + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d)
      osc.connect(gain).connect(pan)
      osc.start(t)
      osc.stop(t + d + 0.05)
    }
  }

  /** A soft 8-bit blip, for the IT-flavoured track. */
  function chip(midi: number, t: number, velocity: number) {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = mtof(midi)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2200 * theme.brightness
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.03 * velocity, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
    const pan = ctx.createStereoPanner()
    pan.pan.value = (rand() - 0.5) * 0.6
    osc.connect(filter).connect(gain).connect(pan).connect(leadBus)
    osc.start(t)
    osc.stop(t + 0.36)
  }

  /** A breathy, hummed lead with a singer's scoop and delayed vibrato. */
  function voice(midi: number, t: number, length: number, velocity: number) {
    const end = t + Math.max(0.2, length)
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = mtof(midi)
    osc.detune.setValueAtTime(-40, t)
    osc.detune.linearRampToValueAtTime(0, t + 0.09)
    const vibrato = ctx.createOscillator()
    vibrato.frequency.value = 5.2
    const depth = ctx.createGain()
    depth.gain.setValueAtTime(0, t)
    depth.gain.linearRampToValueAtTime(0, t + 0.25)
    depth.gain.linearRampToValueAtTime(18, t + 0.7)
    vibrato.connect(depth).connect(osc.detune)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1700 * theme.brightness
    filter.Q.value = 0.7
    const formant = ctx.createBiquadFilter()
    formant.type = 'peaking'
    formant.frequency.value = 850
    formant.Q.value = 1.4
    formant.gain.value = 5
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.07 * velocity, t + 0.12)
    gain.gain.setValueAtTime(0.07 * velocity, end)
    gain.gain.linearRampToValueAtTime(0, end + 0.4)
    osc.connect(filter).connect(formant).connect(gain).connect(leadBus)
    for (const o of [osc, vibrato]) {
      o.start(t)
      o.stop(end + 0.45)
    }
  }

  function bass(midi: number, t: number, length: number, velocity: number) {
    const hold = Math.max(t + 0.55, t + length)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.2 * velocity, t + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.13 * velocity, t + 0.5)
    gain.gain.setValueAtTime(0.13 * velocity, hold)
    gain.gain.exponentialRampToValueAtTime(0.0001, hold + 0.35)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.connect(gain).connect(bassBus)
    const sub = ctx.createOscillator()
    sub.frequency.value = mtof(midi)
    sub.connect(filter)
    // A quiet octave so the bass line survives phone speakers
    const octave = ctx.createOscillator()
    octave.type = 'triangle'
    octave.frequency.value = mtof(midi) * 2
    const octaveGain = ctx.createGain()
    octaveGain.gain.value = 0.25
    octave.connect(octaveGain).connect(filter)
    for (const osc of [sub, octave]) {
      osc.start(t)
      osc.stop(hold + 0.4)
    }
  }

  function kick(t: number, velocity: number) {
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(110, t)
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.12)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.55 * velocity, t + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    osc.connect(gain).connect(drumBus)
    osc.start(t)
    osc.stop(t + 0.32)
  }

  const noise = ctx.createBuffer(1, Math.floor(sr * 0.25), sr)
  noise.getChannelData(0).forEach((_, i, data) => (data[i] = rand() * 2 - 1))

  function shaker(t: number, velocity: number) {
    const src = ctx.createBufferSource()
    src.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 7500
    filter.Q.value = 0.9
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.05 * velocity, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    const pan = ctx.createStereoPanner()
    pan.pan.value = 0.25
    src.connect(filter).connect(gain).connect(pan).connect(drumBus)
    src.start(t, rand() * 0.1)
    src.stop(t + 0.1)
  }

  /** Surface noise and pops, straight to the output so they never pump the compressor. */
  function crackle(level: number, seconds: number) {
    if (level <= 0) return
    const length = Math.floor(seconds * sr)
    const buffer = ctx.createBuffer(2, length, sr)
    const l = buffer.getChannelData(0)
    const r = buffer.getChannelData(1)
    for (let i = 0; i < length; i++) {
      const n = (rand() * 2 - 1) * 0.006
      l[i] = n
      r[i] = n * 0.7 + (rand() * 2 - 1) * 0.002
    }
    for (let p = Math.floor(seconds * 9); p > 0; p--) {
      const at = Math.floor(rand() * (length - 64))
      const amp = rand() ** 3 * 0.5 * (rand() < 0.5 ? -1 : 1)
      const width = 2 + Math.floor(rand() * 20)
      const side = 0.6 + rand() * 0.4
      for (let k = 0; k < width; k++) {
        const v = amp * Math.exp(-k / (width * 0.35)) * (k % 2 ? -0.6 : 1)
        l[at + k] += v * side
        r[at + k] += v * (1.6 - side)
      }
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 500
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 6500
    const gain = ctx.createGain()
    gain.gain.value = level * 0.55
    src.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination)
    src.start(0)
  }

  /* ── Melody: a seeded random walk over the major pentatonic ── */

  const [low, high] = RANGE[theme.lead]
  const scale: number[] = []
  for (let n = low; n <= high; n++) if (PENTATONIC.includes(((n % 12) + 12) % 12)) scale.push(n)
  let position = Math.floor(scale.length / 2)
  const step = () => {
    const leap = rand() < 0.25 ? 2 : 1
    position = Math.max(0, Math.min(scale.length - 1, position + (rand() < 0.5 ? -leap : leap)))
    return scale[position]
  }
  /** On strong beats, land on the nearest note of the chord. */
  const toChordTone = (note: number, voicing: number[]) => {
    let best = note
    let distance = Infinity
    for (const tone of voicing) {
      for (let octave = -24; octave <= 36; octave += 12) {
        const d = Math.abs(tone + octave - note)
        if (d < distance) {
          distance = d
          best = tone + octave
        }
      }
    }
    return best
  }

  /* ── Arrangement ── */

  chords.forEach(([root, ...voicing], i) => {
    const t0 = i * chordLength
    pad(voicing, t0, chordLength)

    let bassNote = root
    while (bassNote > -12) bassNote -= 12

    for (let k = 0; k < theme.barsPerChord; k++) {
      const bt = t0 + k * bar
      const barIndex = i * theme.barsPerChord + k

      bass(R + bassNote, bt, bar * 0.9, k === 0 ? 1 : 0.8)

      voicing.forEach((n, j) => keys(R + n, bt + j * 0.024 + Math.abs(human()), 0.5 + rand() * 0.3))
      if (rand() < 0.8) {
        const at = bt + beat * (rand() < 0.5 ? 2 : 2.5)
        voicing.slice(-3).forEach((n, j) => keys(R + n, at + j * 0.02 + Math.abs(human()), 0.3 + rand() * 0.2))
      }

      if (theme.groove === 'heartbeat') {
        kick(bt, 0.85)
        kick(bt + 0.22, 0.55)
      } else if (theme.groove === 'soft') {
        kick(bt, 0.7)
        kick(bt + beat * 2, 0.55)
        for (let e = 0; e < 8; e++) shaker(bt + (e * beat) / 2 + (e % 2 ? beat * 0.06 : 0), e % 2 ? 1 : 0.6)
      }

      if (theme.lead === 'voice') {
        if (rand() < 0.2 + (1 - theme.density) * 0.3) continue
        const phrase = PHRASES[Math.floor(rand() * PHRASES.length)]
        phrase.forEach(([at, length], idx) => {
          const note = idx === 0 ? toChordTone(step(), voicing) : step()
          voice(R + note, bt + at * beat + human(), length * beat * 0.95, 0.7 + rand() * 0.3)
        })
      } else {
        for (let s = 0; s < 8; s++) {
          if (barIndex % 2 === 1 && s >= 6) continue // breathe at the end of each phrase
          const strong = s % 2 === 0
          if (rand() > theme.density * (strong ? 0.85 : 0.4)) continue
          const note = s % 4 === 0 ? toChordTone(step(), voicing) : step()
          const at = bt + (s * beat) / 2 + (strong ? 0 : beat * 0.07) + Math.abs(human())
          if (theme.lead === 'chip') chip(R + note, at, 0.6 + rand() * 0.4)
          else bell(R + note, at, 0.55 + rand() * 0.45)
        }
      }
    }
  })

  if (!theme.loop) {
    // Resolve home: a long tonic chord that rings out
    const t0 = body
    const tonic = [-1, 2, 4, 7]
    pad(tonic, t0, bar * 1.6)
    bass(R - 12, t0, bar * 1.5, 1)
    tonic.forEach((n, j) => keys(R + n, t0 + j * 0.05, 0.6))
    if (theme.lead === 'voice') voice(R + 12, t0 + 0.1, bar * 1.2, 0.8)
    else bell(R + 24, t0 + 0.6, 0.6)
  }

  crackle(theme.crackle, theme.loop ? body : total)

  const rendered = await ctx.startRendering()

  let channels = [rendered.getChannelData(0), rendered.getChannelData(1)]
  if (theme.loop) {
    // Fold the reverb tail back onto the start, so the loop point is seamless
    const loopLength = Math.round(body * sr)
    channels = channels.map((data) => {
      const out = data.slice(0, loopLength)
      for (let i = loopLength; i < data.length; i++) out[(i - loopLength) % loopLength] += data[i]
      return out
    })
  } else {
    const fade = Math.floor(1.5 * sr)
    for (const data of channels) {
      for (let i = 0; i < fade; i++) data[data.length - 1 - i] *= i / fade
    }
  }

  normalize(channels)
  const envelope = analyse(channels, sr)
  const url = URL.createObjectURL(encodeWav(channels, sr))
  return { url, duration: channels[0].length / sr, envelope }
}

/** Bring every theme to the same loudness, with a soft knee instead of hard clipping. */
function normalize(channels: Float32Array[], targetRms = 0.12) {
  let sum = 0
  let count = 0
  for (const data of channels) {
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
    count += data.length
  }
  const gain = Math.min(10, targetRms / (Math.sqrt(sum / count) || 1))
  for (const data of channels) {
    for (let i = 0; i < data.length; i++) {
      let x = data[i] * gain
      const a = Math.abs(x)
      if (a > 0.85) x = Math.sign(x) * (0.85 + 0.15 * Math.tanh((a - 0.85) / 0.15))
      data[i] = x
    }
  }
}

function analyse(channels: Float32Array[], sr: number): Float32Array {
  const hop = Math.floor(sr / ENVELOPE_RATE)
  const length = channels[0].length
  const envelope = new Float32Array(Math.ceil(length / hop))
  let max = 0
  for (let f = 0; f < envelope.length; f++) {
    const start = f * hop
    const end = Math.min(start + hop, length)
    let sum = 0
    for (const data of channels) for (let i = start; i < end; i++) sum += data[i] * data[i]
    envelope[f] = Math.sqrt(sum / ((end - start) * channels.length))
    max = Math.max(max, envelope[f])
  }
  for (let f = 0; f < envelope.length; f++) envelope[f] = Math.sqrt(envelope[f] / (max || 1))
  return envelope
}
