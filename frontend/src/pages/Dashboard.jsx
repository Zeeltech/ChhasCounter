import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getActivePacks } from '../api/api.js'
import ProgressBar from '../components/ProgressBar.jsx'

export default function Dashboard() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getActivePacks()
      setPacks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) return <div className="spinner" />

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Active Packs</h1>
        <Link to="/new-pack" className="btn btn-primary btn-sm">+ New Pack</Link>
      </div>

      {packs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <p>No active packs.</p>
          <Link to="/new-pack" className="btn btn-primary mt-2">Create first pack</Link>
        </div>
      ) : (
        packs.map(pack => (
          <Link to={`/pack/${pack.id}`} key={pack.id} className="pack-item">
            <div className="pack-item-header">
              <div>
                <div className="pack-name">{pack.productName}</div>
                <div className="pack-meta">
                  {pack.participants.map(u => u.name).join(', ')} · {new Date(pack.purchaseDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className="badge badge-active">Active</span>
            </div>
            <ProgressBar consumed={pack.totalConsumed} total={pack.totalQuantity} />
            <div className="pack-stats">
              <span><span className="stat-label">Remaining: </span><strong>{pack.totalQuantity - pack.totalConsumed}</strong></span>
              <span><span className="stat-label">Price: </span><strong>₹{pack.totalPrice}</strong></span>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
