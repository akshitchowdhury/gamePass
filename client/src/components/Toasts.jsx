export default function Toasts({ items }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`animate-rise pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-2xl backdrop-blur-xl hairline ${
            t.tone === 'error'
              ? 'bg-rose-500/15 text-rose-200'
              : t.tone === 'success'
                ? 'bg-emerald-500/15 text-emerald-100'
                : 'bg-ink-800/90 text-slate-100'
          }`}
        >
          <span className="text-base">
            {t.tone === 'error' ? '⚠️' : t.tone === 'success' ? '✓' : 'ℹ️'}
          </span>
          <span className="font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
