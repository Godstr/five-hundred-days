/** Encodes float PCM channels (−1…1) as a 16-bit little-endian WAV blob. */
export function encodeWav(channels: Float32Array[], sampleRate: number): Blob {
  const count = channels.length
  const frames = channels[0].length
  const dataBytes = frames * count * 2
  const buffer = new ArrayBuffer(44 + dataBytes)
  const view = new DataView(buffer)
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }

  ascii(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, count, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * count * 2, true) // byte rate
  view.setUint16(32, count * 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  ascii(36, 'data')
  view.setUint32(40, dataBytes, true)

  const pcm = new Int16Array(buffer, 44)
  for (let i = 0, o = 0; i < frames; i++) {
    for (let c = 0; c < count; c++, o++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]))
      pcm[o] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

/** A tenth of a second of silence. Playing it inside a tap unlocks the <audio> element on iOS. */
export function silentWav(): Blob {
  return encodeWav([new Float32Array(800)], 8000)
}
