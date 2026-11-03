import type { StoryConfig } from '../config/story'
import { asset } from '../lib/dom'
import * as github from './github'

export type UploadKind = 'memories' | 'audio'

/** Under `npm run dev` the admin writes files on this computer; on the published site it commits to GitHub. */
export const usesGitHub = !import.meta.env.DEV

async function check(response: Response) {
  if (response.ok) return response
  const body = await response.json().catch(() => ({}))
  throw new Error(body.error ?? `Request failed (${response.status})`)
}

export async function loadStory(): Promise<StoryConfig> {
  if (usesGitHub) return github.loadStory()
  return (await check(await fetch('/__admin/story', { cache: 'no-store' }))).json()
}

export async function saveStory(story: StoryConfig): Promise<void> {
  if (usesGitHub) return github.saveStory(story)
  await check(
    await fetch('/__admin/story', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    }),
  )
}

/* A file committed to GitHub only appears on the site after the next deploy,
   so this session shows the copy still in memory. */
const previews = new Map<string, string>()
export const preview = (path: string | undefined) => (path && previews.get(path)) || asset(path)

/** Uploads a file into public/<kind>/ and returns the path to store in the story, e.g. "memories/trip-lx3k9.jpg". */
export async function upload(kind: UploadKind, name: string, file: Blob): Promise<string> {
  let path: string
  if (usesGitHub) path = await github.upload(kind, name, file)
  else {
    const response = await check(
      await fetch(`/__admin/upload?kind=${kind}&name=${encodeURIComponent(name)}`, { method: 'POST', body: file }),
    )
    path = (await response.json()).path
  }
  previews.set(path, URL.createObjectURL(file))
  return path
}

/** Phone photos are 4000px and several MB; the polaroid never needs more than this. */
export async function shrinkPhoto(file: File, maxSide = 1600): Promise<{ blob: Blob; name: string }> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return { blob: file, name: file.name }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 1_500_000) return { blob: file, name: file.name }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process the photo'))), 'image/jpeg', 0.86),
  )
  return { blob, name: file.name.replace(/\.[^.]+$/, '') + '.jpg' }
}
