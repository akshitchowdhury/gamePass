import { TOTAL_PAGES } from '../lib/api'

export default function Pagination({ page, onChange, disabled }) {
  const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1)

  return (
    <nav className="flex items-center justify-center gap-2 py-2">
      <PageBtn
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
        label="Previous page"
      >
        ‹
      </PageBtn>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          onClick={() => onChange(p)}
          className={`h-10 w-10 rounded-xl font-display text-sm font-semibold transition disabled:opacity-50 ${
            p === page
              ? 'btn-neon text-white'
              : 'bg-ink-800/70 text-slate-300 hairline hover:bg-ink-700/70 hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}

      <PageBtn
        disabled={disabled || page >= TOTAL_PAGES}
        onClick={() => onChange(page + 1)}
        label="Next page"
      >
        ›
      </PageBtn>
    </nav>
  )
}

function PageBtn({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800/70 text-lg text-slate-300 hairline transition hover:bg-ink-700/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
