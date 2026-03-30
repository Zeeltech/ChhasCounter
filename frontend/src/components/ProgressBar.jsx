export default function ProgressBar({ consumed, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((consumed / total) * 100)) : 0
  const colorClass = pct >= 100 ? 'red' : pct >= 75 ? 'yellow' : 'green'

  return (
    <div>
      <div className="progress-wrap">
        <div
          className={`progress-bar ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex-between mt-1">
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {consumed} / {total} consumed
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct >= 100 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}
