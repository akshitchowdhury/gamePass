import { useCallback, useEffect, useRef, useState } from 'react'
import { wsUrl } from '../lib/socket'

const MAX_MESSAGES = 200
const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 15000

export function useChatSocket({ username, enabled = true } = {}) {
  const [status, setStatus] = useState('connecting')
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)
  const retryRef = useRef(0)
  const retryTimerRef = useRef(null)
  const clientIdRef = useRef(Math.random().toString(36).slice(2))
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    // 1. Clear any pending reconnect timers to avoid duplicate triggers
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }

    // 2. Safely close existing connection and detach listeners so it won't fire onclose
    if (socketRef.current) {
      socketRef.current.onopen = null
      socketRef.current.onmessage = null
      socketRef.current.onerror = null
      socketRef.current.onclose = null
      socketRef.current.close()
      socketRef.current = null
    }

    setStatus('connecting')
    const socket = new WebSocket(wsUrl())
    socketRef.current = socket

    socket.onopen = () => {
      if (!mountedRef.current) return
      retryRef.current = 0
      setStatus('open')
    }

    socket.onmessage = (event) => {
      if (typeof event.data !== 'string') return
      const lines = event.data.split('\n').filter(Boolean)
      if (!lines.length) return

      setMessages((prev) => {
        const parsedLines = lines.map((line) => {
          const uniqueId = `${Date.now()}-${Math.random()}`
          try {
            const parsed = JSON.parse(line)
            return {
              id: uniqueId,
              username: parsed.username || 'Anonymous',
              text: parsed.text ?? '',
              ts: parsed.ts || Date.now(),
              mine: parsed.clientId === clientIdRef.current,
            }
          } catch {
            return { id: uniqueId, username: 'Anonymous', text: line, ts: Date.now(), mine: false }
          }
        })

        const next = [...prev, ...parsedLines]
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next
      })
    }

    socket.onclose = () => {
      socketRef.current = null
      if (!mountedRef.current) return
      setStatus('closed')

      // Exponential backoff reconnect
      const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** retryRef.current)
      retryRef.current += 1
      
      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, delay)
    }

    socket.onerror = () => {
      // Avoid calling close manually here; let WebSockets trigger onclose natively
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    if (enabled) {
      connect()
    }

    return () => {
      mountedRef.current = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      
      if (socketRef.current) {
        // Strip listeners on unmount so closing the socket doesn't fire onclose logic
        socketRef.current.onopen = null
        socketRef.current.onmessage = null
        socketRef.current.onerror = null
        socketRef.current.onclose = null
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [enabled, connect])

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim()
      if (!trimmed || socketRef.current?.readyState !== WebSocket.OPEN) return false
      socketRef.current.send(
        JSON.stringify({
          username: username || 'Anonymous',
          text: trimmed,
          ts: Date.now(),
          clientId: clientIdRef.current,
        }),
      )
      return true
    },
    [username],
  )

  return { status, messages, sendMessage }
}