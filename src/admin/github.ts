import type { StoryConfig } from '../config/story'
import type { UploadKind } from './api'

/**
 * The admin's backend on the published site: it reads and commits files in the
 * GitHub repo with a personal access token. Every commit triggers a new
 * deploy on Vercel, so saved changes go live a minute or two later.
 */

export const REPO = 'Godstr/five-hundred-days'
const BRANCH = 'main'
const STORY_FILE = 'src/content/story.json'
const API = import.meta.env.VITE_GITHUB_API ?? 'https://api.github.com'
const TOKEN_KEY = 'five-hundred-days:github-token'
const EXTENSIONS: Record<UploadKind, string[]> = {
  memories: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  audio: ['.mp3', '.m4a', '.aac', '.wav', '.ogg'],
}

let token: string | null = null
try {
  token = localStorage.getItem(TOKEN_KEY)
} catch {
  /* private mode: sign in every visit */
}
/** The story file's version when it was loaded; GitHub refuses a save over a newer one. */
let storySha = ''

export const hasToken = () => !!token

export function signOut() {
  token = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* nothing stored */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}/repos/${REPO}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (response.ok) return response.json()
  const message = ((await response.json().catch(() => ({}))) as { message?: string }).message ?? ''
  if (response.status === 401) {
    signOut()
    throw new Error('The GitHub token is invalid or has expired. Sign in again.')
  }
  if (response.status === 403) throw new Error(`The token can't write to ${REPO}. It needs Contents: Read and write.`)
  if (response.status === 404) throw new Error(`The token can't see ${REPO}. Give it access to that repository.`)
  if (response.status === 409 || (response.status === 422 && /sha/i.test(message))) {
    throw new Error('The story was changed on GitHub since this page loaded. Reload, then make your changes again.')
  }
  throw new Error(message || `GitHub request failed (${response.status})`)
}

/** Checks the token can see the repo, then remembers it (on this device only when asked). */
export async function signIn(candidate: string, remember: boolean) {
  token = candidate.trim()
  try {
    await request('')
  } catch (error) {
    token = null
    throw error
  }
  if (remember) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* stays signed in for this visit */
    }
  }
}

const toBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}
const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file'))
    reader.readAsDataURL(blob)
  })

interface FileResponse {
  content: string
  sha: string
}

export async function loadStory(): Promise<StoryConfig> {
  const file = await request<FileResponse>(`/contents/${STORY_FILE}?ref=${BRANCH}`)
  storySha = file.sha
  const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

export async function saveStory(story: StoryConfig): Promise<void> {
  const result = await request<{ content: { sha: string } }>(`/contents/${STORY_FILE}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update the story from the admin',
      content: toBase64(new TextEncoder().encode(`${JSON.stringify(story, null, 2)}\n`)),
      sha: storySha,
      branch: BRANCH,
    }),
  })
  storySha = result.content.sha
}

/** Same naming as the dev server: "Our trip (2).HEIC" → "our-trip-2-lx3k9.jpg". */
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

export async function upload(kind: UploadKind, name: string, file: Blob): Promise<string> {
  const ext = (name.match(/\.[^.]+$/)?.[0] ?? '').toLowerCase()
  if (!EXTENSIONS[kind].includes(ext)) throw new Error(`Unsupported file type "${ext || name}".`)
  if (file.size > 50 * 1024 * 1024) throw new Error('File is too large (max 50 MB)')
  const path = `${kind}/${safeName(name, ext)}`
  await request(`/contents/public/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Add ${path} from the admin`, content: await blobToBase64(file), branch: BRANCH }),
  })
  return path
}
