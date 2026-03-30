import { useState } from 'react'

function UserRow({ user, onConsume, disabled }) {
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
      <span className="user-consume-name">{user.name}</span>
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

export default function ConsumptionButtons({ users, onConsume, disabled }) {
  const sorted = [...users].sort((a, b) => a.id - b.id)
  return (
    <div className="user-consume-list">
      {sorted.map(u => (
        <UserRow key={u.id} user={u} onConsume={onConsume} disabled={disabled} />
      ))}
    </div>
  )
}
