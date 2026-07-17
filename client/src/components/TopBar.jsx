export default function TopBar({ user, search, onSearch, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-neon-500 font-display text-base font-bold text-white shadow-lg">
            G
          </div>
          <span className="hidden font-display text-lg font-bold tracking-wide text-white sm:block">
            GAME<span className="text-brand-400">PASS</span>
          </span>
        </div>

        <div className="relative ml-2 max-w-md flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          >
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search the store…"
            className="w-full rounded-xl bg-ink-800/70 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 hairline outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-gold-400/10 px-3 py-2 hairline sm:flex">
            <span className="text-gold-400">◆</span>
            <span className="font-display text-sm font-semibold text-gold-400">
              {user.points.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-ink-800/70 py-1.5 pl-1.5 pr-3 hairline">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-neon-500 font-display text-sm font-bold text-white">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold text-white">{user.username}</div>
              <div className="text-[11px] text-slate-400">Level {Math.max(1, Math.floor(user.points / 500))}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="grid h-9 w-9 place-items-center rounded-xl bg-ink-800/70 text-slate-400 hairline transition hover:text-rose-400"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
