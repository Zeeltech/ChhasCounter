import { useState } from 'react'
import { updateLog, deleteLog } from '../api/api.js'

export default function LogList({ logs, packCompleted, onRefresh }) {
  const [editId, setEditId] = useState(null)
  const [editQty, setEditQty] = useState('')

  const handleDelete = async (logId) => {
    await deleteLog(logId)
    onRefresh()
  }

  const handleEdit = async (logId) => {
    const q = parseInt(editQty, 10)
    if (!q || q < 1) return
    await updateLog(logId, q)
    setEditId(null)
    setEditQty('')
    onRefresh()
  }

  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (!logs || logs.length === 0) {
    return <p className="text-muted" style={{ fontSize: '0.85rem', paddingTop: 8 }}>No entries yet.</p>
  }

  return (
    <div className="log-list">
      {logs.map(log => (
        <div key={log.id} className="log-item">
          {editId === log.id ? (
            <>
              <span className="log-user">{log.user.name}</span>
              <input
                type="number"
                min="1"
                className="form-input"
                style={{ width: 72 }}
                value={editQty}
                onChange={e => setEditQty(e.target.value)}
                autoFocus
              />
              <button className="btn btn-sm btn-success" onClick={() => handleEdit(log.id)}>✓</button>
              <button className="btn btn-sm btn-ghost" onClick={() => { setEditId(null); setEditQty('') }}>✕</button>
            </>
          ) : (
            <>
              <span className="log-user">{log.user.name}</span>
              <span className="log-time">{formatTime(log.loggedAt)}</span>
              <span className="log-qty">+{log.quantity}</span>
              <div className="log-actions">
                <button
                  className="btn btn-sm btn-ghost"
                  title="Edit"
                  onClick={() => { setEditId(log.id); setEditQty(String(log.quantity)) }}
                >✎</button>
                <button
                  className="btn btn-sm btn-danger"
                  title="Delete"
                  onClick={() => handleDelete(log.id)}
                >✕</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
