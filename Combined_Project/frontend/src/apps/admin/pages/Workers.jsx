import { useState, useEffect } from 'react'
import './Workers.css'

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  /**********************************************
   * LOAD ALL WORKERS (JOIN users + worker_profiles)
   **********************************************/
  const loadWorkers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/workers`)
      if (!res.ok) throw new Error('Failed to fetch workers')

      const data = await res.json()

      const workerData = data.map(w => ({
        id: w.id,
        name: w.name,
        phone: w.phone || '',
        status: w.is_active === false ? 'Inactive' : 'Active',
        rating: w.rating || 0,
        jobs: w.completed_jobs || 0,
      }))

      setWorkers(workerData)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Could not load workers. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkers()
  }, [])

  /**********************************************
   * ADD WORKER
   **********************************************/
  const submitWorker = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    try {
      setLoading(true)

      const res = await fetch(`${apiBase}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
      })

      if (!res.ok) throw new Error('Failed to create worker')

      await loadWorkers()

      setShowAddModal(false)
      setForm({ name: '', email: '', phone: '' })
    } catch (err) {
      console.error(err)
      setError('Could not add worker')
    } finally {
      setLoading(false)
    }
  }

  /**********************************************
   * DELETE WORKER
   **********************************************/
  const handleRemoveWorker = async (id) => {
    if (!window.confirm('Are you sure you want to remove this worker?')) return

    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/workers/${id}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Failed to delete worker')

      setWorkers(workers.filter(w => w.id !== id))
    } catch (err) {
      console.error(err)
      alert('Could not remove worker')
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkerStatus = async (id, currentStatus) => {
    const isActive = currentStatus !== 'Active'
    try {
      const res = await fetch(`${apiBase}/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })
      if (!res.ok) throw new Error('Failed to update status')

      setWorkers(prev => prev.map(w => w.id === id ? { ...w, status: isActive ? 'Active' : 'Inactive' } : w))
    } catch (err) {
      console.error(err)
      alert('Could not update status')
    }
  }

  const filtered = workers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="workers-page">
      <div className="page-header">
        <h2>Worker Directory</h2>
        <p>Manage worker profiles, performance & status</p>
      </div>

      <div className="workers-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add Worker</button>
      </div>

      <div className="workers-grid">
        {loading && <p>Loading workers...</p>}
        {error && !loading && <p className="error">{error}</p>}
        {!loading && filtered.length === 0 && <p>No workers found.</p>}

        {filtered.map(w => (
          <div key={w.id} className="worker-card">
            <div className="worker-header">
              <div className="worker-avatar">{w.name.charAt(0)}</div>

              <div>
                <h3>{w.name}</h3>
                <p className="worker-role">Worker</p>
              </div>

              <span
                className={`status-pill status-${w.status.toLowerCase()}`}
                onClick={() => toggleWorkerStatus(w.id, w.status)}
                style={{ cursor: 'pointer' }}
                title="Click to toggle status"
              >
                {w.status}
              </span>
            </div>

            <div className="worker-body">
              <div className="worker-meta">
                <span>📞 {w.phone}</span>
                <span>⭐ {w.rating}</span>
                <span>🧰 {w.jobs} jobs</span>
              </div>

              <div className="worker-actions">
                <button className="action-btn" onClick={() => alert(`View ${w.id}`)}>View</button>
                <button className="action-btn" onClick={() => alert(`Edit ${w.id}`)}>Edit</button>
                <button className="action-btn danger" onClick={() => handleRemoveWorker(w.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Worker</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form className="modal-form" onSubmit={submitWorker}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workers
