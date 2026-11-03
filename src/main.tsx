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

// The editor lives at #admin, in its own chunk: visitors never download it.
// On the published site it needs a GitHub token before it shows anything.
const isAdmin = window.location.hash === '#admin'

window.addEventListener('hashchange', () => {
  if ((window.location.hash === '#admin') !== isAdmin) window.location.reload()
})
// Sent by the admin plugin when the story is saved: the site refreshes, the editor stays put
if (import.meta.env.DEV && !isAdmin) import.meta.hot?.on('story-changed', () => window.location.reload())

if (isAdmin) {
  void import('./admin/Admin').then(({ default: Admin }) => render(Admin))
} else {
  void Promise.all([import('./App'), import('./lib/easterEggs')]).then(([{ default: App }, { installEasterEggs }]) => {
    installEasterEggs()
    render(App)
  })
}
