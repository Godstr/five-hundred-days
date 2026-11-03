import { KeyRound, LoaderCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cn } from '../lib/dom'
import { inputClass, Label } from './fields'
import { REPO, signIn } from './github'

const NEW_TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

/** On the published site, the editor asks for a GitHub token that can write to the repo. */
export function SignIn({ notice, onSignedIn }: { notice?: string; onSignedIn: () => void }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(notice ?? '')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token.trim()) return
    setBusy(true)
    setError('')
    try {
      await signIn(token, remember)
      onSignedIn()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/8 bg-coal/70 p-6">
        <div className="mb-5 grid size-11 place-items-center rounded-full bg-rose/15 text-rose">
          <KeyRound className="size-5" />
        </div>
        <p className="font-mono text-[10px] tracking-[0.24em] text-amber uppercase">Admin</p>
        <h1 className="mt-1 font-display text-3xl italic">Five Hundred Days</h1>
        <p className="mt-3 text-sm text-dust">
          Changes are saved to GitHub ({REPO}) and the site updates itself a minute or two later. Sign in with a token that
          can write to the repo.
        </p>

        <label className="mt-6 block">
          <Label>GitHub token</Label>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            className={cn(inputClass, 'font-mono')}
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm text-sand">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-rose" />
          Remember on this device
        </label>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy || !token.trim()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
        >
          {busy && <LoaderCircle className="size-4 animate-spin" />}
          Sign in
        </button>

        <details className="mt-6 text-sm text-dust">
          <summary className="cursor-pointer text-sand">How do I get a token?</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Open{' '}
              <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer" className="text-rose underline">
                GitHub → new fine-grained token
              </a>
              .
            </li>
            <li>Repository access: only {REPO.split('/')[1]}.</li>
            <li>Permissions → Contents: Read and write.</li>
            <li>Generate, copy it, paste it here.</li>
          </ol>
        </details>
      </form>
    </div>
  )
}
