import { useCallback, useEffect, useMemo, useState } from 'react'
import { favGame, getAllUsers, paginateGames } from '../lib/api'
import { normalizeGame, priceInfo, money } from '../lib/games'
import TopBar from './TopBar'
import GameCard from './GameCard'
import GameModal from './GameModal'
import Pagination from './Pagination'
import GameCover from './GameCover'

const TABS = [
  { id: 'store', label: 'Store' },
  { id: 'library', label: 'Library' },
  { id: 'favorites', label: 'Favorites' },
]

const ownedKey = (id) => `gamepass_owned_${id}`

export default function Store({ user, setUser, onLogout, notify }) {
  const [tab, setTab] = useState('store')
  const [page, setPage] = useState(1)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null) // game open in modal
  const [busyId, setBusyId] = useState(null)

  const [favorites, setFavorites] = useState(() => new Set(user.favorites || []))
  const [owned, setOwned] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(ownedKey(user.id)) || '[]'))
    } catch {
      return new Set()
    }
  })

  // keep an index of every game we've seen so Library/Favorites can render
  // titles even from other pages
  const [catalog, setCatalog] = useState(() => new Map())

  const persistOwned = useCallback(
    (next) => {
      setOwned(next)
      localStorage.setItem(ownedKey(user.id), JSON.stringify([...next]))
    },
    [user.id],
  )

  // Hydrate favorites the backend already knows about for this user.
  useEffect(() => {
    let cancelled = false
    getAllUsers()
      .then((users) => {
        const me = users?.find((u) => u.Id === user.id)
        if (!cancelled && me?.favorites?.length) {
          setFavorites((prev) => new Set([...prev, ...me.favorites.map((f) => f.id)]))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user.id])

  // Load a page of games.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    paginateGames(page)
      .then((data) => {
        if (cancelled) return
        const list = (data?.gameList || []).map(normalizeGame)
        setGames(list)
        setCatalog((prev) => {
          const next = new Map(prev)
          list.forEach((g) => next.set(g.id, g))
          return next
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load games.')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [page])

  async function handleFavorite(game) {
    if (favorites.has(game.id)) return
    setBusyId(game.id)
    // optimistic
    setFavorites((prev) => new Set(prev).add(game.id))
    try {
      await favGame({ userId: user.id, gameId: game.id })
      notify(`Added “${game.name}” to favorites`, 'success')
    } catch (err) {
      setFavorites((prev) => {
        const next = new Set(prev)
        next.delete(game.id)
        return next
      })
      notify(err.message || 'Could not favorite that game', 'error')
    } finally {
      setBusyId(null)
    }
  }

  function handleBuy(game) {
    if (owned.has(game.id)) return
    const { final } = priceInfo(game)
    if (final > user.points) {
      notify(`Not enough points for “${game.name}” (need ${Math.ceil(final)})`, 'error')
      return
    }
    const next = new Set(owned).add(game.id)
    persistOwned(next)
    setUser((u) => ({ ...u, points: Math.round(u.points - final + game.points) }))
    notify(`“${game.name}” added to your library! +${game.points} pts`, 'success')
    setActive(null)
  }

  const filteredStore = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return games
    return games.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.studio.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q),
    )
  }, [games, search])

  const libraryGames = useMemo(
    () => [...owned].map((id) => catalog.get(id)).filter(Boolean),
    [owned, catalog],
  )
  const favoriteGames = useMemo(
    () => [...favorites].map((id) => catalog.get(id)).filter(Boolean),
    [favorites, catalog],
  )

  const hero = filteredStore[0]

  const cardProps = (game) => ({
    game,
    owned: owned.has(game.id),
    favorited: favorites.has(game.id),
    busy: busyId === game.id,
    onOpen: setActive,
    onBuy: handleBuy,
    onFavorite: handleFavorite,
  })

  return (
    <div className="relative z-10 min-h-screen">
      <TopBar user={user} search={search} onSearch={setSearch} onLogout={onLogout} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ProfileHeader
          user={user}
          ownedCount={owned.size}
          favCount={favorites.size}
        />

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 rounded-2xl bg-ink-900/60 p-1 hairline sm:w-max">
          {TABS.map((t) => {
            const count =
              t.id === 'library' ? owned.size : t.id === 'favorites' ? favorites.size : null
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-xl px-5 py-2 font-display text-sm font-semibold transition sm:flex-none ${
                  tab === t.id
                    ? 'bg-gradient-to-b from-brand-500/25 to-brand-600/10 text-white shadow-[0_0_0_1px_rgba(120,180,255,0.35)_inset]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
                {count !== null && count > 0 && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Hero — store tab only */}
        {tab === 'store' && hero && !loading && (
          <FeaturedHero game={hero} {...cardProps(hero)} />
        )}

        <div className="mt-8">
          {tab === 'store' && (
            <SectionHeader
              title="Browse the store"
              sub={`Page ${page} of 5${search ? ` · filtering “${search}”` : ''}`}
            />
          )}
          {tab === 'library' && (
            <SectionHeader title="Your library" sub={`${owned.size} owned titles`} />
          )}
          {tab === 'favorites' && (
            <SectionHeader title="Favorites" sub={`${favorites.size} saved titles`} />
          )}

          {tab === 'store' && (
            <>
              {loading && <GridSkeleton />}
              {error && !loading && (
                <ErrorState message={error} onRetry={() => setPage((p) => p)} />
              )}
              {!loading && !error && filteredStore.length === 0 && (
                <EmptyState label="No games match your search on this page." />
              )}
              {!loading && !error && filteredStore.length > 0 && (
                <Grid>
                  {filteredStore.map((g) => (
                    <GameCard key={g.id} {...cardProps(g)} />
                  ))}
                </Grid>
              )}
              <div className="mt-8">
                <Pagination page={page} onChange={setPage} disabled={loading} />
              </div>
            </>
          )}

          {tab === 'library' &&
            (libraryGames.length ? (
              <Grid>
                {libraryGames.map((g) => (
                  <GameCard key={g.id} {...cardProps(g)} />
                ))}
              </Grid>
            ) : (
              <EmptyState label="Your library is empty — buy a game to get started." />
            ))}

          {tab === 'favorites' &&
            (favoriteGames.length ? (
              <Grid>
                {favoriteGames.map((g) => (
                  <GameCard key={g.id} {...cardProps(g)} />
                ))}
              </Grid>
            ) : (
              <EmptyState label="No favorites yet — tap the ♥ on any game." />
            ))}
        </div>
      </main>

      {active && (
        <GameModal
          {...cardProps(active)}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function ProfileHeader({ user, ownedCount, favCount }) {
  const level = Math.max(1, Math.floor(user.points / 500))
  return (
    <section className="relative overflow-hidden rounded-3xl glass card-glow">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(90% 140% at 0% 0%, rgba(0,112,243,0.35), transparent 55%), radial-gradient(90% 140% at 100% 0%, rgba(168,85,247,0.3), transparent 55%)',
        }}
      />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-neon-500 font-display text-3xl font-bold text-white shadow-xl">
          {user.username[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-300">
            Player Profile
          </p>
          <h1 className="font-display text-3xl font-bold text-white">{user.username}</h1>
          <p className="truncate text-sm text-slate-400">{user.email}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:ml-auto">
          <Stat value={user.points.toLocaleString()} label="Points" accent="text-gold-400" />
          <Stat value={ownedCount} label="Owned" />
          <Stat value={favCount} label="Favorites" accent="text-rose-400" />
        </div>
      </div>
      <div className="relative flex items-center gap-3 border-t border-white/5 px-6 py-3 text-xs text-slate-400 sm:px-7">
        <span className="rounded-full bg-brand-500/15 px-3 py-1 font-semibold text-brand-300">
          Level {level}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-400"
            style={{ width: `${(user.points % 500) / 5}%` }}
          />
        </div>
        <span>{500 - (user.points % 500)} pts to next level</span>
      </div>
    </section>
  )
}

function Stat({ value, label, accent = 'text-white' }) {
  return (
    <div className="rounded-2xl bg-black/25 px-4 py-3 text-center hairline">
      <div className={`font-display text-xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}

function FeaturedHero({ game, ...actions }) {
  const price = priceInfo(game)
  return (
    <section className="animate-rise mt-6 grid overflow-hidden rounded-3xl glass card-glow md:grid-cols-2">
      <div className="relative min-h-[220px]">
        <GameCover game={game} big className="absolute inset-0 h-full w-full" />
      </div>
      <div className="flex flex-col justify-center gap-4 p-7">
        <span className="w-max rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-300">
          ★ Featured
        </span>
        <div>
          <h2 className="font-display text-3xl font-bold text-white">{game.name}</h2>
          <p className="text-sm text-slate-400">
            {game.studio} · {game.category}
          </p>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
          {game.summary || 'A standout title from the GamePass catalogue.'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            {price.hasDiscount && (
              <span className="text-sm text-slate-500 line-through">{money(price.base)}</span>
            )}
            <span className="font-display text-2xl font-bold text-white">{money(price.final)}</span>
            {price.hasDiscount && (
              <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-emerald-950">
                -{price.percent}%
              </span>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => actions.onFavorite(game)}
              disabled={actions.favorited || actions.busy}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold hairline transition disabled:opacity-60 ${
                actions.favorited ? 'bg-rose-500/15 text-rose-400' : 'text-white hover:bg-white/5'
              }`}
            >
              {actions.favorited ? '♥' : '♡'}
            </button>
            {actions.owned ? (
              <button
                type="button"
                onClick={() => actions.onOpen(game)}
                className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hairline"
              >
                ▶ Play
              </button>
            ) : (
              <button
                type="button"
                onClick={() => actions.onBuy(game)}
                className="btn-neon rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              >
                Buy now
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400">{sub}</p>
      </div>
    </div>
  )
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl glass">
          <div className="aspect-[16/10] w-full animate-pulse bg-white/5" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="grid place-items-center rounded-3xl glass py-20 text-center">
      <div className="text-5xl opacity-40">🎮</div>
      <p className="mt-3 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="grid place-items-center rounded-3xl glass py-16 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="mt-3 max-w-md text-sm text-slate-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-neon mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  )
}
