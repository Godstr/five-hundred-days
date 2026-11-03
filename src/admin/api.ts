import type { StoryConfig } from '../config/story'

export type UploadKind = 'memories' | 'audio'

async function check(response: Response) {
  if (response.ok) return response
  const body = await response.json().catch(() => ({}))
  throw new Error(body.error ?? `Request failed (${response.status})`)
}

export async function loadStory(): Promise<StoryConfig> {
  return (await check(await fetch('/__admin/story', { cache: 'no-store' }))).json()
}

export async function saveStory(story: StoryConfig): Promise<void> {
  await check(
    await fetch('/__admin/story', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    }),
  )
}

/** Uploads a file into public/<kind>/ and returns the path to store in the story, e.g. "memories/trip-lx3k9.jpg". */
export async function upload(kind: UploadKind, name: string, file: Blob): Promise<string> {
  const response = await check(
    await fetch(`/__admin/upload?kind=${kind}&name=${encodeURIComponent(name)}`, { method: 'POST', body: file }),
  )
  return (await response.json()).path
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
