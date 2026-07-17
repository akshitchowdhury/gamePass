import { useEffect } from 'react'
import GameCover from './GameCover'
import { priceInfo, money } from '../lib/games'

export default function GameModal({ game, owned, favorited, busy, onClose, onBuy, onFavorite }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!game) return null
  const price = priceInfo(game)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="glass card-glow animate-pop relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/7] w-full">
          <GameCover game={game} big className="h-full w-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white/80 backdrop-blur transition hover:bg-black/70 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur">
                {game.category}
              </span>
              {owned && (
                <span className="rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white">
                  In Library
                </span>
              )}
              {price.hasDiscount && (
                <span className="rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-bold text-emerald-950">
                  -{price.percent}% OFF
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white drop-shadow-lg">
              {game.name}
            </h2>
            <p className="text-sm text-slate-300">by {game.studio}</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-300">
            {game.summary || 'No description available for this title yet — dive in and be the first to explore it.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-2">
              {price.hasDiscount && (
                <span className="text-sm text-slate-500 line-through">{money(price.base)}</span>
              )}
              <span className="font-display text-2xl font-bold text-white">
                {money(price.final)}
              </span>
            </div>
            {game.points > 0 && (
              <span className="rounded-full bg-gold-400/10 px-3 py-1 text-sm font-semibold text-gold-400">
                Earn {game.points} points
              </span>
            )}

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => onFavorite(game)}
                disabled={busy || favorited}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold hairline transition disabled:opacity-60 ${
                  favorited
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'text-white hover:bg-white/5'
                }`}
              >
                {favorited ? '♥ Favorited' : '♡ Favorite'}
              </button>

              {owned ? (
                <button
                  type="button"
                  className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hairline"
                >
                  ▶ Play now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onBuy(game)}
                  disabled={busy}
                  className="btn-neon rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Buy {money(price.final)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
