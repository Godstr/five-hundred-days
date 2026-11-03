#!/usr/bin/env node
/**
 * Draws the app icons and the link-preview image: a vinyl record with a heart
 * on its label. Pure Node, no dependencies: every pixel is shaded and
 * supersampled by hand, then written as a PNG with zlib.
 *
 *   npm run icons
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

/* ── PNG encoding ─────────────────────────────────────────── */

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes) {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgb) {
  const stride = width * 3 + 1
  const raw = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) rgb.copy(raw, y * stride + 1, y * width * 3, (y + 1) * width * 3)
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // truecolour RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ── Shading ──────────────────────────────────────────────── */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const clamp = (v) => Math.max(0, Math.min(1, v))
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

const INK = hex('#0e0c0b')
const ROSE = hex('#ff6f91')
const AMBER = hex('#f2a457')
const DISC = hex('#131114')
const LABEL = ['#ffe3d3', '#ff9fb3', '#e5577d', '#9e2a52'].map(hex)
const CREAM = hex('#fff4ea')

function gradient(stops, t) {
  const x = clamp(t) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  return mix(stops[i], stops[i + 1], x - i)
}

/** Colour of one point. Layout: canvas size (w, h), record centre (cx, cy) and radius R. */
function shade(x, y, { w, h, cx, cy, R }) {
  // Background: espresso dark with a rose and an amber glow
  const big = Math.max(w, h)
  let c = INK
  const rose = Math.exp(-(((x - w * 0.28) ** 2 + (y - h * 0.22) ** 2) / (big * 0.45) ** 2))
  const amber = Math.exp(-(((x - w * 0.88) ** 2 + (y - h * 0.95) ** 2) / (big * 0.4) ** 2))
  c = mix(c, ROSE, rose * 0.32)
  c = mix(c, AMBER, amber * 0.22)

  const dx = x - cx
  const dy = y - cy
  const r = Math.hypot(dx, dy) / R
  const angle = Math.atan2(dy, dx)

  // Soft shadow around the record
  if (r > 1) return mix(c, [0, 0, 0], 0.55 * (1 - smooth(1, 1.16, r)))

  // The disc: grooves, gaps between tracks, a rim highlight, two sheen streaks
  let disc = DISC
  const groove = Math.sin(r * Math.PI * 2 * 58) * 0.5 + 0.5
  disc = mix(disc, hex('#221e24'), groove * 0.35)
  for (let i = 1; i < 8; i++) {
    const gap = 0.39 + (0.56 * i) / 8
    disc = mix(disc, hex('#2b272d'), Math.exp(-(((r - gap) / 0.006) ** 2)) * 0.8)
  }
  const sheen = Math.max(0, Math.cos(angle + 0.9)) ** 18 + Math.max(0, Math.cos(angle - 2.25)) ** 18 * 0.8
  disc = mix(disc, [1, 0.86, 0.9], sheen * 0.16 * smooth(0.38, 0.5, r))
  disc = mix(disc, [1, 1, 1], smooth(0.965, 0.985, r) * (1 - smooth(0.985, 1, r)) * 0.25)
  c = disc

  // The label, with a heart in the middle
  const labelR = 0.37
  if (r < labelR) {
    const lx = dx / (R * labelR)
    const ly = dy / (R * labelR)
    let label = gradient(LABEL, Math.hypot(lx + 0.36, ly + 0.42) / 1.55)
    label = mix(label, [0.3, 0.05, 0.12], smooth(0.9, 1, r / labelR) * 0.35)
    const hx = lx / 0.46
    const hy = -ly / 0.46 + 0.12
    const heart = (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3
    label = mix(label, CREAM, heart <= 0 ? 1 : 0)
    c = label
  }
  return c
}

function render(width, height, layout, samples = 3) {
  const rgb = Buffer.alloc(width * height * 3)
  const scene = { w: width, h: height, ...layout }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = [0, 0, 0]
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const c = shade(x + (sx + 0.5) / samples, y + (sy + 0.5) / samples, scene)
          acc = acc.map((v, i) => v + c[i])
        }
      }
      const o = (y * width + x) * 3
      for (let i = 0; i < 3; i++) rgb[o + i] = Math.round(clamp(acc[i] / samples ** 2) * 255)
    }
  }
  return encodePng(width, height, rgb)
}

function icon(size, scale) {
  return render(size, size, { cx: size / 2, cy: size / 2, R: size * scale })
}

mkdirSync(OUT, { recursive: true })
const files = {
  'apple-touch-icon.png': icon(180, 0.42),
  'icon-192.png': icon(192, 0.42),
  'icon-512.png': icon(512, 0.42),
  'icon-maskable-512.png': icon(512, 0.34),
  'og.png': render(1200, 630, { cx: 1200 * 0.66, cy: 315, R: 630 * 0.4 }, 2),
}
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(OUT, name), data)
  console.log(`✓ public/${name}  ${(data.length / 1024).toFixed(1)} kB`)
}
