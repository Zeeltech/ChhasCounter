import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPack, getPackSummary, getLogs, addConsumption, undoLastEntry, deletePack } from '../api/api.js'
import ProgressBar from '../components/ProgressBar.jsx'
import ConsumptionButtons from '../components/ConsumptionButtons.jsx'
import LogList from '../components/LogList.jsx'
import Toast, { useToast } from '../components/Toast.jsx'

export default function PackDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [pack, setPack] = useState(null)
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('consume')

  const load = useCallback(async () => {
    try {
      const [p, s, l] = await Promise.all([
        getPack(id),
        getPackSummary(id),
        getLogs(id),
      ])
      setPack(p)
      setSummary(s)
      setLogs(l)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [load])

  const handleConsume = async (userId, qty) => {
    try {
      await addConsumption(id, userId, qty)
      await load()
      showToast(`+${qty} logged!`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error logging consumption', 'error')
    }
  }

  const handleUndo = async () => {
    try {
      const entry = await undoLastEntry(id)
      await load()
      showToast(`Undid: ${entry.user.name} +${entry.quantity}`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Nothing to undo', 'error')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this pack and all its consumption logs? This cannot be undone.')) return
    try {
      await deletePack(id)
      navigate('/')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete pack', 'error')
    }
  }

  if (loading || !pack) return <div className="spinner" />

  const isCompleted = pack.status === 'COMPLETED'

  return (
    <div>
      <Toast toast={toast} />

      {/* Back */}
      <div className="flex-between mb-1">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/pack/${id}/edit`)}>✎ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>

      {/* Pack header */}
      <div className="card mt-1">
        <div className="flex-between mb-1">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{pack.productName}</h2>
          <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-active'}`}>
            {isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>
        <div className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 12 }}>
          {new Date(pack.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} ·
          ₹{pack.totalPrice}
        </div>
        <ProgressBar consumed={pack.totalConsumed} total={pack.totalQuantity} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-2">
        {['consume', 'summary', 'logs'].map(t => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
            style={{ flex: 1, textTransform: 'capitalize' }}
          >
            {t === 'consume' ? '🥛 Log' : t === 'summary' ? '💰 Cost' : '📋 History'}
          </button>
        ))}
      </div>

      {/* Consume tab */}
      {tab === 'consume' && (
        <div className="card mt-2">
          {isCompleted ? (
            <div className="empty">
              <div className="empty-icon">✅</div>
              <p>Pack completed! All units consumed.</p>
            </div>
          ) : (
            <>
              <div className="flex-between mb-1">
                <span className="fw-bold">Log Consumption</span>
                <button className="btn btn-ghost btn-sm" onClick={handleUndo}>↩ Undo</button>
              </div>
              <ConsumptionButtons
                users={pack.participants}
                onConsume={handleConsume}
                disabled={isCompleted}
                userBreakdown={summary?.userBreakdown}
              />
            </>
          )}
        </div>
      )}

      {/* Summary tab */}
      {tab === 'summary' && summary && (
        <div className="card mt-2">
          <div className="flex-between mb-1">
            <span className="fw-bold">Cost Breakdown</span>
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>₹{summary.perUnitCost} / unit</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th style={{ textAlign: 'center' }}>Units</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.userBreakdown.map(row => (
                <tr key={row.userId}>
                  <td>{row.userName}</td>
                  <td style={{ textAlign: 'center' }}>{row.consumed}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{row.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex-between mt-2" style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
            <span className="fw-bold">Total Consumed</span>
            <span className="fw-bold">{summary.totalConsumed} / {summary.totalQuantity}</span>
          </div>
        </div>
      )}

      {/* Logs tab */}
      {tab === 'logs' && (
        <div className="card mt-2">
          <span className="fw-bold" style={{ display: 'block', marginBottom: 10 }}>
            Consumption Log ({logs.length})
          </span>
          <LogList logs={logs} packCompleted={isCompleted} onRefresh={load} />
        </div>
      )}
    </div>
  )
}
