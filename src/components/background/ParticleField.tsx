import { useEffect, useRef } from 'react'
import { engine } from '../../audio'

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  twinkle: number
  hue: string
}

interface Glyph {
  x: number
  y: number
  vy: number
  life: number
  char: string
  size: number
}

const COLORS = ['255,232,214', '255,170,190', '242,164,87', '255,255,255']
const GLYPHS = ['♪', '♫', '♡']

/** Floating dust and bokeh. Brightens with the music, and little notes drift up while something plays. */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const glyphs: Glyph[] = []
    let frame = 0
    let last = performance.now()
    let glyphTimer = 0

    const seed = () => {
      const count = Math.round(Math.min(70, (width * height) / 16000))
      particles = Array.from({ length: count }, () => {
        const bokeh = Math.random() < 0.14
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: bokeh ? 3 + Math.random() * 6 : 0.5 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 6,
          vy: -(3 + Math.random() * 10),
          alpha: bokeh ? 0.05 + Math.random() * 0.08 : 0.2 + Math.random() * 0.45,
          twinkle: Math.random() * Math.PI * 2,
          hue: COLORS[Math.floor(Math.random() * COLORS.length)],
        }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const level = engine.getLevel()
      const speed = 1 + level * 2.2
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx * dt * speed
        p.y += p.vy * dt * speed
        p.twinkle += dt * (1.2 + level * 3)
        if (p.y < -12) {
          p.y = height + 12
          p.x = Math.random() * width
        }
        if (p.x < -12) p.x = width + 12
        if (p.x > width + 12) p.x = -12
        const alpha = p.alpha * (0.65 + 0.35 * Math.sin(p.twinkle)) * (1 + level * 0.9)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${p.hue},${Math.min(1, alpha)})`
        ctx.arc(p.x, p.y, p.r * (1 + level * 0.25), 0, Math.PI * 2)
        ctx.fill()
      }

      glyphTimer -= dt
      if (level > 0.15 && glyphTimer <= 0 && glyphs.length < 7) {
        glyphTimer = 0.9 + Math.random() * 1.4
        glyphs.push({
          x: width * (0.1 + Math.random() * 0.8),
          y: height + 20,
          vy: -(28 + Math.random() * 30),
          life: 0,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          size: 12 + Math.random() * 10,
        })
      }
      for (let i = glyphs.length - 1; i >= 0; i--) {
        const g = glyphs[i]
        g.life += dt
        g.y += g.vy * dt
        const fade = Math.min(1, g.life / 1.5) * Math.max(0, 1 - g.life / 9)
        if (fade <= 0 && g.life > 1) {
          glyphs.splice(i, 1)
          continue
        }
        ctx.font = `${g.size}px "Cormorant Garamond Variable", Georgia, serif`
        ctx.fillStyle = `rgba(255,190,205,${0.22 * fade})`
        ctx.fillText(g.char, g.x + Math.sin(g.life * 1.3) * 14, g.y)
      }

      if (!reduced) frame = requestAnimationFrame(draw)
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (document.visibilityState === 'visible' && !reduced) {
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }

    resize()
    if (reduced) draw(performance.now())
    else frame = requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0" />
}
