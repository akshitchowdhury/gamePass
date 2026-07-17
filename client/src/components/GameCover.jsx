import { coverFor } from '../lib/games'

// Procedural "box art" — a category-tinted gradient with a giant glyph + initials.
export default function GameCover({ game, className = '', big = false }) {
  const cover = coverFor(game)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: cover.gradient }}
    >
      <div className="absolute inset-0" style={{ background: cover.glow }} />

      {/* faint diagonal sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

      {/* giant emoji watermark */}
      <div
        className={`absolute -right-3 -bottom-4 select-none opacity-25 blur-[1px] ${
          big ? 'text-[11rem]' : 'text-[6.5rem]'
        }`}
      >
        {cover.emoji}
      </div>

      {/* initials monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-display font-bold tracking-tight text-white/90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] ${
            big ? 'text-7xl' : 'text-5xl'
          }`}
          style={{ textShadow: `0 0 30px ${cover.accent}66` }}
        >
          {cover.initials}
        </span>
      </div>

      {/* bottom fade for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  )
}
