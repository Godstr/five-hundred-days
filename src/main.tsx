import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted variable fonts (Latin + Cyrillic, so Mongolian text works too)
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/cormorant-garamond/wght.css'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import '@fontsource-variable/caveat/wght.css'
import './index.css'

const root = createRoot(document.getElementById('root')!)
const render = (Component: ComponentType) =>
  root.render(
    <StrictMode>
      <Component />
    </StrictMode>,
  )

// The editor at #admin only exists under `npm run dev`. In a build this branch
// is removed, so the admin code never ships to her.
const isAdmin = import.meta.env.DEV && window.location.hash === '#admin'

if (import.meta.env.DEV) {
  window.addEventListener('hashchange', () => {
    if ((window.location.hash === '#admin') !== isAdmin) window.location.reload()
  })
  // Sent by the admin plugin when the story is saved: the site refreshes, the editor stays put
  if (!isAdmin) import.meta.hot?.on('story-changed', () => window.location.reload())
}

if (isAdmin) {
  void import('./admin/Admin').then(({ default: Admin }) => render(Admin))
} else {
  void Promise.all([import('./App'), import('./lib/easterEggs')]).then(([{ default: App }, { installEasterEggs }]) => {
    installEasterEggs()
    render(App)
  })
}
