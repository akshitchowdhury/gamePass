// Derives the chat WebSocket URL from the same base the REST client uses
// (see api.js) so both point at the Go server together.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function wsUrl(path = '/ws') {
  return BASE.replace(/^http/, 'ws') + path
}
