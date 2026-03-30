import { useState } from 'react'

function UserRow({ user, count, onConsume, disabled }) {
  const [loading, setLoading] = useState(false)

  const handle = async (qty) => {
    setLoading(true)
    try {
      await onConsume(user.id, qty)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-consume-row">
      <div className="user-avatar user-avatar-sm">
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={user.name} className="user-avatar-img" />
          : <span>{user.name[0].toUpperCase()}</span>
        }
      </div>
      <span className="user-consume-name">{user.name}</span>
      <span className="user-count-badge">{count}</span>
      <button
        className="consume-btn user-plus-btn"
        onClick={() => handle(1)}
        disabled={disabled || loading}
        aria-label={`+1 for ${user.name}`}
      >
        +1
      </button>
    </div>
  )
}

export default function ConsumptionButtons({ users, onConsume, disabled, userBreakdown }) {
  const sorted = [...users].sort((a, b) => a.id - b.id)
  const countMap = Object.fromEntries((userBreakdown || []).map(b => [b.userId, b.consumed]))
  return (
    <div className="user-consume-list">
      {sorted.map(u => (
        <UserRow key={u.id} user={u} count={countMap[u.id] ?? 0} onConsume={onConsume} disabled={disabled} />
      ))}
    </div>
  )
}
