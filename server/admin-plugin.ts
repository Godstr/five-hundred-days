import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Backend for the #admin editor. It only exists under `npm run dev`
 * (never in the built site) and only answers requests from this computer.
 *
 *   GET  /__admin/story                   → src/content/story.json
 *   PUT  /__admin/story                   ← the whole story, pretty-printed back to disk
 *   POST /__admin/upload?kind=&name=      ← raw file bytes → public/<kind>/<safe-name>
 */

const STORY_FILE = 'src/content/story.json'
const UPLOADS: Record<string, string[]> = {
  memories: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  audio: ['.mp3', '.m4a', '.aac', '.wav', '.ogg'],
}
const MAX_UPLOAD = 80 * 1024 * 1024
const MAX_STORY = 2 * 1024 * 1024

function isLocal(req: IncomingMessage): boolean {
  const address = req.socket.remoteAddress ?? ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error(`File is too large (max ${Math.round(limit / 1024 / 1024)} MB)`))
        req.destroy()
      } else chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** "Our trip (2).HEIC" → "our-trip-2-lx3k9.jpg": readable, unique, safe for any host. */
function safeName(original: string, ext: string): string {
  const base =
    original
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'file'
  return `${base}-${Date.now().toString(36)}${ext}`
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export function adminPlugin(): Plugin {
  let root = process.cwd()

  return {
    name: 'five-hundred-days-admin',
    apply: 'serve',
    configResolved(config) {
      root = config.root
    },
    // Instead of Vite's reload-every-tab, tell the site tab to refresh and leave the editor alone
    handleHotUpdate({ file, server }) {
      if (path.resolve(file) !== path.join(root, STORY_FILE)) return
      server.ws.send({ type: 'custom', event: 'story-changed' })
      return []
    },
    configureServer(server) {
      server.middlewares.use('/__admin', async (req, res) => {
        if (!isLocal(req)) return json(res, 403, { error: 'The admin only works on the computer running the dev server.' })
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const storyPath = path.join(root, STORY_FILE)

          if (url.pathname === '/story' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            return res.end(await readFile(storyPath))
          }

          if (url.pathname === '/story' && req.method === 'PUT') {
            const story = JSON.parse((await readBody(req, MAX_STORY)).toString('utf8'))
            if (!story || !Array.isArray(story.tracks) || typeof story.startDate !== 'string') {
              return json(res, 400, { error: 'That does not look like a story.' })
            }
            await writeFile(storyPath, `${JSON.stringify(story, null, 2)}\n`)
            return json(res, 200, { ok: true })
          }

          if (url.pathname === '/upload' && req.method === 'POST') {
            const kind = url.searchParams.get('kind') ?? ''
            const name = url.searchParams.get('name') ?? 'file'
            const ext = path.extname(name).toLowerCase()
            if (!UPLOADS[kind]?.includes(ext)) {
              return json(res, 400, { error: `Unsupported file type "${ext || name}".` })
            }
            const bytes = await readBody(req, MAX_UPLOAD)
            const file = safeName(name, ext)
            const folder = path.join(root, 'public', kind)
            await mkdir(folder, { recursive: true })
            await writeFile(path.join(folder, file), bytes)
            return json(res, 200, { path: `${kind}/${file}` })
          }

          json(res, 404, { error: 'Not found' })
        } catch (error) {
          json(res, 500, { error: error instanceof Error ? error.message : String(error) })
        }
      })
    },
  }
}
