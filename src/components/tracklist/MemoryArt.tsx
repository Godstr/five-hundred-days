import { useId, type ReactNode } from 'react'
import type { Mood } from '../../config/story'
import { MOOD_COLORS } from './moodColors'
import { mulberry32 } from '../../lib/random'

const HEART_PIXELS = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']

/**
 * Hand-drawn SVG "photos" shown in the polaroids until real photos are added.
 * Each mood is a small scene: steppe road trip, crescent moon, stage lights, a
 * ger in the snow, a pixel heart…
 */
export function MemoryArt({ mood, seed = 0 }: { mood: Mood; seed?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`
  const [deep, mid, light] = MOOD_COLORS[mood]
  // Recreated every render so the same memory always draws the same scene
  const rand = mulberry32(seed * 131 + mood.length * 17)

  const dots = (count: number, area: [number, number, number, number], radius: [number, number]) =>
    Array.from({ length: count }, () => ({
      x: area[0] + rand() * area[2],
      y: area[1] + rand() * area[3],
      r: radius[0] + rand() * (radius[1] - radius[0]),
      o: 0.3 + rand() * 0.7,
    }))

  let scene: ReactNode
  switch (mood) {
    case 'dawn':
      scene = (
        <>
          <circle cx="200" cy="268" r="74" fill={url('sun')} />
          <path d="M0 292 C 80 250 150 282 212 262 S 340 238 400 268 V400 H0Z" fill="#4a2440" opacity="0.9" />
          <path d="M0 322 C 90 300 170 334 262 312 S 362 300 400 316 V400 H0Z" fill="#26121f" />
          <path d="M120 150 q8 -8 16 0 q8 -8 16 0 M168 128 q6 -6 12 0 q6 -6 12 0" stroke="#4a2440" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )
      break
    case 'road':
      scene = (
        <>
          <circle cx="292" cy="236" r="44" fill={url('sun')} />
          <polygon points="0,262 58,214 108,242 170,188 232,236 292,206 352,242 400,214 400,300 0,300" fill="#2c1a36" />
          <rect y="280" width="400" height="120" fill="#24131f" />
          <polygon points="186,282 214,282 330,400 70,400" fill="#120a11" />
          <path d="M200 288 L200 400" stroke={light} strokeWidth="3" strokeDasharray="9 13" opacity="0.6" />
          {dots(14, [0, 300, 400, 90], [1, 2.4]).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={light} opacity={d.o * 0.25} />
          ))}
        </>
      )
      break
    case 'night':
      scene = (
        <>
          {dots(70, [0, 0, 400, 300], [0.5, 1.8]).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o * 0.8} />
          ))}
          <mask id={id('moon')}>
            <rect width="400" height="400" fill="#fff" />
            <circle cx="308" cy="94" r="38" fill="#000" />
          </mask>
          <circle cx="288" cy="108" r="40" fill="#f6efe0" mask={url('moon')} />
          <path d="M0 268 C 60 226 104 304 162 262 S 262 222 322 264 S 384 292 400 272" stroke={light} strokeWidth="2.6" fill="none" opacity="0.9" filter={url('glow')} />
          <path d="M0 300 C 70 270 120 330 190 296 S 300 268 400 304" stroke={light} strokeWidth="1.4" fill="none" opacity="0.4" />
          <text x="96" y="236" fontSize="26" fill={light} opacity="0.8" style={{ fontFamily: 'serif' }}>♪</text>
          <text x="248" y="226" fontSize="22" fill={light} opacity="0.65" style={{ fontFamily: 'serif' }}>♫</text>
        </>
      )
      break
    case 'stage':
      scene = (
        <>
          {[90, 200, 310].map((x, i) => (
            <polygon key={x} points={`${x - 6},0 ${x + 6},0 ${x + 90 - i * 40},400 ${x - 90 + (2 - i) * 40},400`} fill={url('beam')} />
          ))}
          <ellipse cx="200" cy="392" rx="190" ry="40" fill={light} opacity="0.18" />
          {dots(22, [0, 220, 400, 180], [3, 13]).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={light} opacity={d.o * 0.3} />
          ))}
          <line x1="200" y1="262" x2="200" y2="400" stroke="#0a0408" strokeWidth="6" />
          <line x1="164" y1="400" x2="236" y2="400" stroke="#0a0408" strokeWidth="10" />
          <rect x="186" y="214" width="28" height="48" rx="14" fill="#0a0408" transform="rotate(-14 200 238)" />
        </>
      )
      break
    case 'snow':
      scene = (
        <>
          <polygon points="0,250 70,186 130,226 196,170 262,222 330,180 400,232 400,320 0,320" fill="#9fb4cc" opacity="0.55" />
          <polygon points="0,282 90,238 160,270 240,232 320,268 400,246 400,340 0,340" fill="#6b84a3" opacity="0.7" />
          <path d="M0 330 C 100 312 300 318 400 326 V400 H0Z" fill="#eef3f9" />
          <g transform="translate(0 6)">
            <path d="M212 300 Q250 262 288 300 Z" fill="#f7f3ec" />
            <rect x="214" y="300" width="72" height="34" fill="#ebe4d8" />
            <path d="M214 310 H286 M214 322 H286" stroke="#b58b62" strokeWidth="1.6" />
            <rect x="243" y="312" width="15" height="22" fill="#f2a457" />
            <circle cx="250" cy="278" r="4" fill="#b58b62" />
          </g>
          {dots(80, [0, 0, 400, 400], [0.8, 2.6]).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o * 0.9} />
          ))}
        </>
      )
      break
    case 'code':
      scene = (
        <>
          <pattern id={id('grid')} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke={light} strokeOpacity="0.08" />
          </pattern>
          <rect width="400" height="400" fill={url('grid')} />
          <g filter={url('glow')}>
            {HEART_PIXELS.flatMap((row, y) =>
              [...row].map((cell, x) =>
                cell === 'X' ? <rect key={`${x}-${y}`} x={123 + x * 22} y={128 + y * 22} width="20" height="20" fill="#ff6f91" /> : null,
              ),
            )}
          </g>
          <text x="28" y="52" fontSize="15" fill={light} opacity="0.85" style={{ fontFamily: 'monospace' }}>
            {'$ git commit -m "us"'}
          </text>
          <text x="28" y="356" fontSize="13" fill={light} opacity="0.6" style={{ fontFamily: 'monospace' }}>
            {'[main 500d4y5] 1 file changed, ∞ insertions(+)'}
          </text>
          <rect x="28" y="364" width="9" height="16" fill={light} opacity="0.8" />
        </>
      )
      break
    case 'golden':
      scene = (
        <>
          <circle cx="200" cy="262" r="96" fill={url('sun')} />
          {dots(6, [60, 60, 300, 220], [6, 26]).map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff3d6" opacity={0.08 + d.o * 0.1} />
          ))}
          <path d="M0 316 C 120 296 260 300 400 312 V400 H0Z" fill="#3a1a0e" />
          {Array.from({ length: 70 }, (_, i) => {
            const x = (i / 70) * 410 + rand() * 6
            const h = 26 + rand() * 46
            return <path key={i} d={`M${x} 400 Q${x + 4} ${360 - h / 2} ${x + (rand() - 0.5) * 18} ${330 - h}`} stroke="#2a120a" strokeWidth="2.2" fill="none" />
          })}
        </>
      )
      break
    case 'encore':
      scene = (
        <>
          <text
            x="200"
            y="262"
            textAnchor="middle"
            fontSize="176"
            fontStyle="italic"
            fill="none"
            stroke={light}
            strokeWidth="1.6"
            opacity="0.75"
            style={{ fontFamily: 'var(--font-display)', fontFeatureSettings: '"lnum" 1' }}
          >
            500
          </text>
          {Array.from({ length: 46 }, (_, i) => {
            const colors = [light, '#f2a457', '#fff1e6', '#b9a2ff']
            const x = rand() * 400
            const y = rand() * 400
            return <rect key={i} x={x} y={y} width="6" height="12" rx="1.5" fill={colors[i % 4]} opacity={0.5 + rand() * 0.5} transform={`rotate(${rand() * 180} ${x} ${y})`} />
          })}
          {[
            [88, 92, 14],
            [318, 120, 10],
            [292, 330, 16],
          ].map(([x, y, s]) => (
            <path key={x} d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`} fill="#fff6ea" />
          ))}
        </>
      )
      break
  }

  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="size-full" role="img" aria-label={`Illustration: ${mood}`}>
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.62" stopColor={mid} />
          <stop offset="1" stopColor={mood === 'night' || mood === 'code' || mood === 'stage' ? mid : light} />
        </linearGradient>
        <radialGradient id={id('sun')}>
          <stop offset="0" stopColor="#fff8ea" />
          <stop offset="0.45" stopColor={light} />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('leak')} cx="0.85" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#ffb38a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb38a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vignette')} r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <filter id={id('glow')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={id('grain')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="400" height="400" fill={url('sky')} />
      {scene}
      <rect width="400" height="400" fill={url('leak')} style={{ mixBlendMode: 'screen' }} />
      <rect width="400" height="400" filter={url('grain')} opacity="0.13" style={{ mixBlendMode: 'overlay' }} />
      <rect width="400" height="400" fill={url('vignette')} />
    </svg>
  )
}
