import { ParticleField } from './ParticleField'

/** Fixed, layered ambience: drifting glows, floating dust that dances to the music, film grain, vignette. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <ParticleField />
      <div className="grain" />
      <div className="vignette" />
    </div>
  )
}
