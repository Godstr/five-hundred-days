# Five Hundred Days ♡

An interactive "album" for a 500-day anniversary: a live counter, a spinning vinyl you can tap to play, a tracklist of memories with polaroids, a vault holding a letter, and a few developer Easter eggs.

Vite + React 19 + Tailwind CSS 4 + Framer Motion + Lucide.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from your phone on the same Wi-Fi
npm run build          # static site in dist/
```

## Admin: edit it without code

Run `npm run dev` and open **http://localhost:5173/#admin**.

- **Memories:** add, delete, reorder; give each one a photo and a song or voice note (drag & drop works). Photos are shrunk to 1600px automatically.
- **Side A:** the record's song and an optional voice note.
- **Also editable:** names, start date, the letter, the vault code and the liner notes, in EN and МН side by side.
- **Saving:** press **Save** (or Ctrl + S). The site in another tab refreshes by itself.
- **Publishing:** run `npm run build` and deploy.

The admin only exists in the dev server and only accepts requests from your own computer. It is never part of the built site, so she can't open it. Content is saved to `src/content/story.json`; uploads go to `public/memories/` and `public/audio/`.

## Make it yours: editing by hand

Everything personal lives in **`src/content/story.json`** (its shape is described in `src/config/story.ts`):

- `HER`, `ME`, `START` at the top: names and the day it all began (local time).
- `tracks`: one entry per memory (title, date, place, note, polaroid caption, the text on the back).
- **Photos**: put them in `public/memories/` and set `photo: 'memories/01.jpg'`. Square photos look best.
- **Audio**: put files in `public/audio/` and set `audio: 'audio/01.m4a'` per track, `music.src` for the record in the hero (her own song would be perfect), and `voiceNote.src` to show a voice-note button under the record.
  Without files, every track plays a small instrumental composed in the browser, so nothing is ever silent.
- `vault.code`: digits only. It defaults to the start date as DDMMYY.
- `letter`, `linerNotes`, `credits`, `secret.note`: all the text.

## English / Mongolian

The **EN / МН** switch sits in the top bar and on the intro screen. The choice is remembered. On first visit the site follows the phone's language.

- Personal text in `story.ts` can be one string (shown in both languages) or `{ en: '…', mn: '…' }`.
- Interface text (buttons, headings, hints) lives in `src/i18n/strings.ts`.
- Mongolian dates are formatted by the app itself ("2025 оны 6-р сарын 24"), since many browsers lack Mongolian date data.

## Easter eggs

- Open the browser console: a styled love note is waiting. Type `love()` for more.
- `Ctrl + Shift + L` opens a secret terminal that types out a `git log` of your relationship and the note.
- On a phone: tap the **500 DAYS** logo five times.

## Deploy

`npm run build` and upload `dist/` to Vercel, Netlify, GitHub Pages or any static host. Asset paths are relative, so sub-folders work.
After deploying, change `og:image` in `index.html` to the absolute URL of `og.png` for nice link previews.

On her iPhone: Safari → Share → **Add to Home Screen** opens it full-screen like an app.

## Notes

- The page asks search engines not to index it, but anyone with the link can open it.
- The vault is a cute lock, not real security: the letter is in the page's code.
- `npm run icons` regenerates the app icons and preview image (`scripts/generate-icons.mjs`).
