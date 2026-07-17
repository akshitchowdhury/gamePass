// Helpers for the game objects returned by the Go backend.
// The API nests studio/category oddly: game.studio_name.studio_name etc.

export function normalizeGame(raw) {
  return {
    id: raw.id,
    name: raw.game_name ?? 'Untitled',
    studio: raw.studio_name?.studio_name ?? 'Unknown Studio',
    category: raw.category_name?.category_name ?? 'Uncategorized',
    price: Number(raw.game_price ?? 0),
    offer: Number(raw.offer ?? 0),
    points: Number(raw.purchase_points ?? 0),
    summary: raw.game_summary ?? '',
  }
}

// `offer` is treated as a percentage discount when 0 < offer < 100,
// otherwise as an absolute discounted price.
export function priceInfo(game) {
  const base = game.price
  let final = base
  let percent = 0

  if (game.offer > 0 && game.offer < 100) {
    percent = Math.round(game.offer)
    final = base * (1 - game.offer / 100)
  } else if (game.offer >= 100 && game.offer < base) {
    final = game.offer
    percent = base > 0 ? Math.round((1 - final / base) * 100) : 0
  }

  return {
    hasDiscount: percent > 0 && final < base,
    percent,
    base,
    final,
  }
}

export function money(n) {
  return n <= 0 ? 'Free' : `$${n.toFixed(2)}`
}

// ---- Procedural cover art (no external image assets needed) ----

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const CATEGORY_STYLE = {
  action: { hue: 355, emoji: '⚔️' },
  adventure: { hue: 35, emoji: '🧭' },
  rpg: { hue: 275, emoji: '🐉' },
  shooter: { hue: 12, emoji: '🎯' },
  strategy: { hue: 205, emoji: '♟️' },
  racing: { hue: 145, emoji: '🏎️' },
  sports: { hue: 95, emoji: '🏆' },
  horror: { hue: 320, emoji: '💀' },
  puzzle: { hue: 185, emoji: '🧩' },
  simulation: { hue: 220, emoji: '🛰️' },
  indie: { hue: 300, emoji: '🎨' },
  platformer: { hue: 50, emoji: '🍄' },
}

export function coverFor(game) {
  const key = game.category.toLowerCase().trim()
  const style = CATEGORY_STYLE[key]
  const h = hash(game.name)
  const hue = style ? style.hue : h % 360
  const hue2 = (hue + 40 + (h % 60)) % 360
  const emoji = style ? style.emoji : '🎮'

  const angle = 115 + (h % 60)
  const gradient = `linear-gradient(${angle}deg,
    hsl(${hue} 70% 22%) 0%,
    hsl(${hue} 62% 12%) 45%,
    hsl(${hue2} 68% 10%) 100%)`

  // decorative blobs positioned deterministically
  const glow = `radial-gradient(60% 55% at ${20 + (h % 40)}% ${15 + (h % 30)}%,
    hsla(${hue2} 90% 62% / 0.55), transparent 60%),
    radial-gradient(50% 50% at ${70 + (h % 20)}% ${70 - (h % 25)}%,
    hsla(${hue} 90% 60% / 0.4), transparent 60%)`

  const initials = game.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return { gradient, glow, emoji, accent: `hsl(${hue2} 85% 62%)`, initials }
}
