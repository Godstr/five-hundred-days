import { MotionConfig } from 'framer-motion'
import { Backdrop } from './components/background/Backdrop'
import { SecretTerminal } from './components/easter/SecretTerminal'
import { Hero } from './components/hero/Hero'
import { IntroOverlay } from './components/layout/IntroOverlay'
import { TopBar } from './components/layout/TopBar'
import { NowPlayingBar } from './components/player/NowPlayingBar'
import { Credits } from './components/sections/Credits'
import { Footer } from './components/sections/Footer'
import { LinerNotes } from './components/sections/LinerNotes'
import { Marquee } from './components/sections/Marquee'
import { Tracklist } from './components/tracklist/Tracklist'
import { TrackSheet } from './components/tracklist/TrackSheet'
import { HeartBursts, Toaster } from './components/ui/Effects'
import { LetterReader } from './components/vault/LetterReader'
import { Vault } from './components/vault/Vault'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Backdrop />
      <IntroOverlay />
      <TopBar />

      <main className="relative overflow-x-clip">
        <Hero />
        <Marquee />
        <Tracklist />
        <LinerNotes />
        <Credits />
        <Vault />
        <Footer />
      </main>

      <NowPlayingBar />
      <TrackSheet />
      <LetterReader />
      <SecretTerminal />
      <Toaster />
      <HeartBursts />
    </MotionConfig>
  )
}
