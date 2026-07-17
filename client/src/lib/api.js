// Thin client for the GamePass Go backend (see server/mainHandler.go).
// Base URL is overridable via VITE_API_URL; defaults to the local Go server.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text.trim() || `Request failed (${res.status})`)
  }

  // Some endpoints (favGame -> 201) may return an empty body.
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// POST /addUser — registers/enters a user, returns the created record incl. id.
export function addUser({ username, email, password, points = 100 }) {
  return request('/addUser', {
    method: 'POST',
    body: { username, email, password, points },
  })
}

// GET /getAllUsers — every user with their favorited games (used to hydrate state).
export function getAllUsers() {
  return request('/getAllUsers')
}

// GET /paginateGames?part=N  (N = 1..5) — returns { page, limit, gameList }.
export function paginateGames(part) {
  return request(`/paginateGames?part=${part}`)
}

// GET /getAllGames — the full catalogue { games: [...] }.
export function getAllGames() {
  return request('/getAllGames')
}

// POST /favGame — persists a favorite for the given user + game.
export function favGame({ userId, gameId }) {
  return request('/favGame', {
    method: 'POST',
    body: { user_id: userId, game_id: gameId },
  })
}

export const TOTAL_PAGES = 5
