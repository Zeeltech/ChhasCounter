import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory } from '../api/api.js'
import ProgressBar from '../components/ProgressBar.jsx'

export default function History() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then(setPacks).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  return (
    <div>
      <h1 className="section-title mb-1">Completed Packs</h1>

      {packs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📜</div>
          <p>No completed packs yet.</p>
        </div>
      ) : (
        packs.map(pack => (
          <Link to={`/pack/${pack.id}`} key={pack.id} className="pack-item mt-1">
            <div className="pack-item-header">
              <div>
                <div className="pack-name">{pack.productName}</div>
                <div className="pack-meta">
                  {pack.participants.map(u => u.name).join(', ')} · {new Date(pack.purchaseDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className="badge badge-completed">Done</span>
            </div>
            <ProgressBar consumed={pack.totalConsumed} total={pack.totalQuantity} />
            <div className="pack-stats">
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>₹{pack.totalPrice} total</span>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
