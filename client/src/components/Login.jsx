import { useState } from 'react'
import { addUser, getAllUsers } from '../lib/api'

export default function Login({ onAuthed }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Enter a username and password to continue.')
      return
    }

    setLoading(true)
    try {
      // The backend exposes /addUser as the entry point. New players are
      // created here; returning names (unique constraint) fall back to a
      // lookup via /getAllUsers so the session can still resume.
      const created = await addUser({
        username: username.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@gamepass.gg`,
        password,
        points: 1500,
      })
      onAuthed({
        id: created.id,
        username: created.username,
        email: created.email,
        points: created.points ?? 1500,
      })
    } catch {
      // Username likely already exists — try to resume that profile.
      try {
        const users = await getAllUsers()
        const match = users?.find(
          (u) => (u.UName || '').toLowerCase() === username.trim().toLowerCase(),
        )
        if (match) {
          onAuthed({
            id: match.Id,
            username: match.UName,
            email: `${match.UName.toLowerCase()}@gamepass.gg`,
            points: match.Upoints ?? 0,
            favorites: (match.favorites || []).map((f) => f.id),
          })
          return
        }
        setError('That username is taken. Try another one.')
      } catch {
        setError('Could not reach the GamePass server. Is it running on :8080?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl glass card-glow lg:grid-cols-2">
        {/* Brand / art side */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 15% 10%, rgba(0,112,243,0.5), transparent 55%), radial-gradient(120% 90% at 90% 90%, rgba(168,85,247,0.45), transparent 55%), #070b16',
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative">
            <Logo />
          </div>
          <div className="relative space-y-4">
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Your library.
              <br />
              Unlimited play.
            </h2>
            <p className="max-w-sm text-sm text-slate-300">
              Jump into hundreds of titles — buy the ones you love, favorite the
              rest, and earn points with every pickup.
            </p>
            <div className="flex gap-6 pt-2">
              {[
                ['500+', 'Titles'],
                ['50+', 'Studios'],
                ['4K', 'HDR ready'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-white">{n}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 sm:p-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mt-6 lg:mt-0">
            <h1 className="font-display text-2xl font-bold text-white">Enter GamePass</h1>
            <p className="mt-1 text-sm text-slate-400">
              Sign in to your player profile to start playing.
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="neo_gamer"
              autoFocus
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com (optional)"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hairline">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full rounded-xl py-3 font-display text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-70"
            >
              {loading ? 'Connecting…' : 'Enter the Arena'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            New here? We'll create your profile automatically. Existing name resumes your session.
          </p>
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-neon-500 font-display text-lg font-bold text-white shadow-lg">
        G
      </div>
      <span className="font-display text-xl font-bold tracking-wide text-white">
        GAME<span className="text-brand-400">PASS</span>
      </span>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-ink-900/70 px-4 py-3 text-sm text-white placeholder-slate-600 hairline outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      />
    </label>
  )
}
