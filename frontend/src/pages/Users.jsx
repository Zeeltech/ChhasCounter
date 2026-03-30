import { useEffect, useRef, useState } from 'react'
import { getUsers, createUser, deleteUser, uploadAvatar, removeAvatar } from '../api/api.js'
import Toast, { useToast } from '../components/Toast.jsx'

export default function Users() {
  const [users, setUsers] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast, showToast } = useToast()
  const fileRefs = useRef({})

  const load = () => getUsers().then(setUsers)

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setLoading(true)
    try {
      await createUser(name)
      setNewName('')
      await load()
      showToast(`${name} added!`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return
    try {
      await deleteUser(id)
      await load()
      showToast(`${name} removed`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete user', 'error')
    }
  }

  const handleAvatarUpload = async (id, e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await uploadAvatar(id, file)
      await load()
      showToast('Avatar updated!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload avatar', 'error')
    }
    e.target.value = ''
  }

  const handleAvatarRemove = async (id) => {
    try {
      await removeAvatar(id)
      await load()
      showToast('Avatar removed', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove avatar', 'error')
    }
  }

  return (
    <div>
      <Toast toast={toast} />
      <h1 className="section-title mb-1">Users</h1>

      <form onSubmit={handleAdd} className="card">
        <label className="form-label">Add New User</label>
        <div className="flex gap-1">
          <input
            className="form-input"
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            maxLength={50}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !newName.trim()}>
            Add
          </button>
        </div>
        <p className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>Max 10 users</p>
      </form>

      <div className="card mt-2">
        {users.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>No users yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', borderBottom: '1px solid var(--surface2)' }}>
                {/* Avatar — click to upload */}
                <div
                  className="user-avatar"
                  title="Click to change photo"
                  onClick={() => fileRefs.current[u.id]?.click()}
                >
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.name} className="user-avatar-img" />
                    : <span>{u.name[0].toUpperCase()}</span>
                  }
                  <div className="user-avatar-overlay">📷</div>
                </div>
                <input
                  ref={el => { fileRefs.current[u.id] = el }}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => handleAvatarUpload(u.id, e)}
                />

                <span style={{ fontWeight: 500, flex: 1 }}>{u.name}</span>

                {u.avatarUrl && (
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Remove photo"
                    onClick={() => handleAvatarRemove(u.id)}
                  >✕</button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u.id, u.name)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
