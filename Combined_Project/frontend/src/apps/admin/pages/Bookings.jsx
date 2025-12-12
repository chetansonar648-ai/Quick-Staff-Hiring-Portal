import { useState, useEffect } from 'react'
import './Bookings.css'

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    worker_id: '',
    service_id: '',
    booking_date: '',
    duration_hours: '',
    total_price: '',
    status: 'pending',
    payment_status: 'pending',
    payment_method: '',
  })

  // Auxiliary data for dropdowns
  const [clients, setClients] = useState([])
  const [dbWorkers, setDbWorkers] = useState([]) // "workers" state is used for booking list, so rename or separate
  const [services, setServices] = useState([])

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const handleAddBooking = () => {
    setShowAddModal(true)
  }
  const handleViewBooking = (id) => {
    const booking = bookings.find(b => b.id === id)
    if (booking) alert(`Booking Details:\nClient: ${booking.client}\nWorker: ${booking.worker}\nService: ${booking.service}\nStatus: ${booking.status}`)
  }

  const handleEditBooking = (id) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) return
    const newStatus = prompt(`Update status for Booking #${id} (pending, accepted, in_progress, completed, cancelled):`, booking.status)
    if (newStatus && newStatus !== booking.status) {
      updateBookingStatus(id, newStatus)
    }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')

      // Refresh list
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    } catch (err) {
      console.error(err)
      alert('Could not update booking status')
    }
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return
    try {
      const res = await fetch(`${apiBase}/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete booking')
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error(err)
      alert('Could not delete booking')
    }
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!form.client_id || !form.worker_id || !form.service_id || !form.booking_date || !form.total_price) return
    try {
      setLoading(true)
      const payload = { ...form }
      const res = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to create booking')
      const created = await res.json()
      setBookings([{
        id: created.id,
        client: created.client_name || `Client #${created.client_id}`,
        worker: created.worker_name || `Worker #${created.worker_id}`,
        service: created.service_name || `Service #${created.service_id}`,
        date: created.booking_date ? new Date(created.booking_date).toLocaleDateString() : '',
        time: created.booking_date ? new Date(created.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        status: created.status || 'pending',
        amount: created.total_price != null ? `$${Number(created.total_price).toFixed(2)}` : '$0',
      }, ...bookings])
      setShowAddModal(false)
      setForm({
        client_id: '',
        worker_id: '',
        service_id: '',
        booking_date: '',
        duration_hours: '',
        total_price: '',
        status: 'pending',
        payment_status: 'pending',
        payment_method: '',
      })
      setError('')
    } catch (err) {
      setError('Could not add booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const load = async () => {
      try {
        setLoading(true)

        // Parallel fetch for bookings + dropdown data
        const [resBookings, resClients, resWorkers, resServices] = await Promise.all([
          fetch(`${apiBase}/bookings`),
          fetch(`${apiBase}/clients`),
          fetch(`${apiBase}/workers`),
          fetch(`${apiBase}/services`)
        ])

        if (!resBookings.ok) throw new Error('Failed to fetch bookings')

        const data = await resBookings.json()
        const clientData = resClients.ok ? await resClients.json() : []
        const workerData = resWorkers.ok ? await resWorkers.json() : []
        const serviceData = resServices.ok ? await resServices.json() : []

        setClients(clientData)
        setDbWorkers(workerData)
        setServices(serviceData)

        setBookings(
          (data || []).map((b) => ({
            id: b.id,
            client: b.client_name || `Client #${b.client_id}`,
            worker: b.worker_name || `Worker #${b.worker_id}`,
            service: b.service_name || `Service #${b.service_id}`,
            date: b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '',
            time: b.booking_date ? new Date(b.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            status: b.status || 'pending',
            amount: b.total_price != null ? `$${Number(b.total_price).toFixed(2)}` : '$0',
          }))
        )
        setError('')
      } catch (err) {
        console.error(err)
        setError('Could not load data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = (bookings || []).filter((b) =>
    (b.client && b.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.worker && b.worker.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.service && b.service.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h2>Bookings</h2>
        <p>Track all bookings with clients and assigned workers</p>
      </div>

      <div className="bookings-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by client, worker, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="add-btn" onClick={handleAddBooking}>+ New Booking</button>
      </div>

      <div className="bookings-table-container">
        {loading && <div className="no-results"><p>Loading bookings...</p></div>}
        {error && !loading && <div className="no-results"><p>{error}</p></div>}
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Worker</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.client}</td>
                <td>{b.worker}</td>
                <td>{b.service}</td>
                <td>{b.date}</td>
                <td>{b.time}</td>
                <td>
                  <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                </td>
                <td className="amount-cell">{b.amount}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon-btn" title="View" onClick={() => handleViewBooking(b.id)}>👁️</button>
                    <button className="action-icon-btn" title="Edit" onClick={() => handleEditBooking(b.id)}>✏️</button>
                    <button className="action-icon-btn" title="Delete" onClick={() => handleCancelBooking(b.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <p>No bookings found.</p>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Booking</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={submitBooking}>
              <div className="form-group">
                <label>Client</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Worker</label>
                <select
                  value={form.worker_id}
                  onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
                  required
                >
                  <option value="">Select Worker</option>
                  {dbWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Service</label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                  required
                >
                  <option value="">Select Service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.base_price})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Booking Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.duration_hours}
                  onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Total Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total_price}
                  onChange={(e) => setForm({ ...form, total_price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="refunded">refunded</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <input
                  type="text"
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  placeholder="card / cash / transfer"
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

export default Bookings


