import GameCover from './GameCover'
import { priceInfo, money } from '../lib/games'

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-10-9.3C.4 8.6 1.9 5 5.3 5 7.4 5 8.9 6.2 12 9c3.1-2.8 4.6-4 6.7-4 3.4 0 4.9 3.6 3.3 6.7C19.5 16.4 12 21 12 21z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function GameCard({ game, owned, favorited, busy, onOpen, onBuy, onFavorite }) {
  const price = priceInfo(game)

  return (
    <article className="game-card glass card-glow group relative flex flex-col overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => onOpen(game)}
        className="relative block aspect-[16/10] w-full text-left"
      >
        <GameCover game={game} className="h-full w-full" />

        {price.hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-emerald-950 shadow-lg">
            -{price.percent}%
          </span>
        )}
        {owned && (
          <span className="absolute right-3 top-3 rounded-md bg-brand-600/90 px-2 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
            In Library
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-md bg-black/45 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur">
          {game.category}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-h-[2.6rem]">
          <h3 className="font-display text-[15px] font-semibold leading-tight text-white line-clamp-1">
            {game.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{game.studio}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="leading-tight">
            {price.hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 line-through">{money(price.base)}</span>
                <span className="font-display text-base font-bold text-emerald-400">
                  {money(price.final)}
                </span>
              </div>
            ) : (
              <span className="font-display text-base font-bold text-white">
                {money(price.final)}
              </span>
            )}
            {game.points > 0 && (
              <div className="text-[11px] text-gold-400">+{game.points} pts</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFavorite(game)}
              disabled={busy || favorited}
              title={favorited ? 'Favorited' : 'Add to favorites'}
              className={`grid h-9 w-9 place-items-center rounded-lg hairline transition ${
                favorited
                  ? 'bg-rose-500/15 text-rose-400 heart-pulse'
                  : 'text-slate-300 hover:bg-white/5 hover:text-rose-400'
              } disabled:opacity-60`}
            >
              <HeartIcon filled={favorited} />
            </button>

            {owned ? (
              <button
                type="button"
                onClick={() => onOpen(game)}
                className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold text-white hairline transition hover:bg-white/15"
              >
                Play
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBuy(game)}
                disabled={busy}
                className="btn-neon rounded-lg px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
