import { useEffect, useRef, useState } from 'react'
import { useChatSocket } from '../hooks/useChatSocket'

const STATUS_STYLES = {
  open: { dot: 'bg-emerald-400', label: 'Connected' },
  connecting: { dot: 'bg-gold-400 animate-pulse', label: 'Connecting…' },
  closed: { dot: 'bg-rose-500', label: 'Reconnecting…' },
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function ChatWidget({ username }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [unread, setUnread] = useState(0)
  const listRef = useRef(null)

  const { status, messages, sendMessage } = useChatSocket({ username, enabled: true })

  useEffect(() => {
    if (!open && messages.length) {
      setUnread((n) => n + 1)
    }

    console.log("MESSAGES list",messages)
  }, [messages, open])

  useEffect(() => {
    if (open) {
      setUnread(0)
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [open, messages])

  function handleSend(e) {
    e.preventDefault()
    console.log("Message sent", draft)
    if (sendMessage(draft)) setDraft('')
  }

  const { dot, label } = STATUS_STYLES[status] || STATUS_STYLES.closed

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="animate-rise flex h-[28rem] w-80 max-h-[70vh] flex-col overflow-hidden rounded-2xl glass card-glow sm:w-96">
          <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-neon-500 font-display text-sm font-bold text-white">
              💬
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-display text-sm font-bold text-white">Game Chat</div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close chat"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <div className="grid h-full place-items-center text-center">
                <p className="text-sm text-slate-500">No messages yet — say hi 👋</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm hairline ${
                    m.mine
                      ? 'bg-gradient-to-br from-brand-600/60 to-neon-500/40 text-white'
                      : 'bg-ink-800/70 text-slate-100'
                  }`}
                >
                  {!m.mine && (
                    <div className="text-[11px] font-semibold text-brand-300">{m.username}</div>
                  )}
                  <div className="break-words leading-snug">{m.text}</div>
                  <div className="mt-0.5 text-right text-[10px] text-slate-400/80">
                    {formatTime(m.ts)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/5 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={status === 'open' ? 'Type a message…' : 'Connecting…'}
              disabled={status !== 'open'}
              maxLength={500}
              className="w-full rounded-xl bg-ink-800/70 px-3 py-2.5 text-sm text-white placeholder-slate-500 hairline outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status !== 'open' || !draft.trim()}
              className="btn-neon shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-neon-500 text-2xl text-white shadow-xl card-glow transition hover:brightness-110"
        title={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-950 ${dot}`}
        />
      </button>
    </div>
  )
}
