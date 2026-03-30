import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsers, getPack, updatePack } from '../api/api.js'
import Toast, { useToast } from '../components/Toast.jsx'

export default function EditPack() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [users, setUsers] = useState([])
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getUsers(), getPack(id)]).then(([us, pack]) => {
      setUsers(us)
      setForm({
        productName: pack.productName,
        totalQuantity: String(pack.totalQuantity),
        totalPrice: String(pack.totalPrice),
        purchaseDate: pack.purchaseDate,
        participantIds: pack.participants.map(p => p.id),
      })
    }).catch(() => navigate('/'))
  }, [id, navigate])

  const toggleParticipant = (uid) => {
    setForm(f => ({
      ...f,
      participantIds: f.participantIds.includes(uid)
        ? f.participantIds.filter(x => x !== uid)
        : [...f.participantIds, uid],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productName.trim()) return showToast('Product name is required', 'error')
    if (!form.totalQuantity || Number(form.totalQuantity) < 1) return showToast('Total quantity must be at least 1', 'error')
    if (!form.totalPrice || Number(form.totalPrice) <= 0) return showToast('Total price must be positive', 'error')
    if (form.participantIds.length === 0) return showToast('Select at least 1 participant', 'error')

    setSubmitting(true)
    try {
      await updatePack(id, {
        productName: form.productName.trim(),
        totalQuantity: Number(form.totalQuantity),
        totalPrice: Number(form.totalPrice),
        purchaseDate: form.purchaseDate,
        participantIds: form.participantIds,
      })
      navigate(`/pack/${id}`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update pack', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) return <div className="spinner" />

  return (
    <div>
      <Toast toast={toast} />
      <div className="flex-between mb-1">
        <h1 className="section-title">Edit Pack</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/pack/${id}`)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="card mt-1">
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            className="form-input"
            placeholder="e.g. Amul Buttermilk"
            value={form.productName}
            onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Total Quantity (units)</label>
          <input
            type="number"
            min="1"
            className="form-input"
            placeholder="e.g. 30"
            value={form.totalQuantity}
            onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Total Price (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="form-input"
            placeholder="e.g. 750"
            value={form.totalPrice}
            onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Purchase Date</label>
          <input
            type="date"
            className="form-input"
            value={form.purchaseDate}
            onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Participants</label>
          {users.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>No users found.</p>
          ) : (
            <div className="checkbox-list">
              {users.map(u => (
                <label key={u.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.participantIds.includes(u.id)}
                    onChange={() => toggleParticipant(u.id)}
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg mt-2"
          disabled={submitting || form.participantIds.length === 0}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
