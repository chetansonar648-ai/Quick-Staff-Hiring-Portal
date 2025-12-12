import { useState, useEffect } from 'react'
import './RatingsReviews.css'

const RatingsReviews = () => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')



  /* 
   * FETCH REVIEWS FROM API 
   */
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${apiBase}/reviews`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data = await res.json()

      const formatted = data.map(r => ({
        id: r.id,
        client: r.reviewer_name || `User #${r.reviewer_id}`,
        service: r.service_name || 'Service',
        rating: r.rating,
        comment: r.comment,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
        status: 'Published' // Schema doesn't have status, defaulting to Published
      }))
      setReviews(formatted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    // Mock approval as backend doesn't support status yet
    alert(`Review #${id} approved (Mock)`)
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject/delete this review?')) return
    try {
      const res = await fetch(`${apiBase}/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete review')
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
      alert('Could not delete review')
    }
  }

  const handleDelete = (id) => handleReject(id) // Same action for now
  const handleEdit = (id) => alert(`Edit review #${id} (Not implemented)`)
  const handleAddReview = () => alert('Reviews are added via Booking completion (Not implemented in Admin)')

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && review.status === 'Published') ||
      (filter === 'pending' && review.status === 'Pending') ||
      (filter === 'high' && review.rating >= 4) ||
      (filter === 'low' && review.rating <= 2)

    return matchesSearch && matchesFilter
  })

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  const renderStars = (rating) => {
    const safeRating = rating || 0
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < safeRating ? 'star filled' : 'star'}>
        {i < safeRating ? '⭐' : '☆'}
      </span>
    ))
  }

  return (
    <div className="ratings-reviews-page">
      <div className="page-header">
        <h2>Ratings & Reviews</h2>
        <p>Manage and monitor customer feedback and ratings</p>
      </div>

      <div className="reviews-overview">
        <div className="overview-card main-stat">
          <div className="stat-content">
            <h3>Average Rating</h3>
            <div className="rating-display">
              <span className="rating-number">{averageRating}</span>
              <div className="stars-large">
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
            </div>
            <p className="total-reviews">{reviews.length} Total Reviews</p>
          </div>
        </div>
        <div className="overview-card">
          <h4>5 Stars</h4>
          <p className="stat-value">{reviews.filter(r => r.rating === 5).length}</p>
        </div>
        <div className="overview-card">
          <h4>4 Stars</h4>
          <p className="stat-value">{reviews.filter(r => r.rating === 4).length}</p>
        </div>
        <div className="overview-card">
          <h4>3 Stars</h4>
          <p className="stat-value">{reviews.filter(r => r.rating === 3).length}</p>
        </div>
        <div className="overview-card">
          <h4>2 Stars</h4>
          <p className="stat-value">{reviews.filter(r => r.rating === 2).length}</p>
        </div>
        <div className="overview-card">
          <h4>1 Star</h4>
          <p className="stat-value">{reviews.filter(r => r.rating === 1).length}</p>
        </div>
      </div>

      <div className="reviews-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="add-btn" onClick={handleAddReview}>+ Add Review</button>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High (4+)
          </button>
          <button
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low (≤2)
          </button>
        </div>
      </div>

      <div className="reviews-list">
        {filteredReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">{review.client.charAt(0)}</div>
                <div className="reviewer-details">
                  <h4>{review.client}</h4>
                  <p className="service-name">{review.service}</p>
                </div>
              </div>
              <div className="review-meta">
                <div className="rating-stars">
                  {renderStars(review.rating)}
                </div>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
            <div className="review-footer">
              <span className={`status-badge status-${review.status.toLowerCase()}`}>
                {review.status}
              </span>
              <div className="review-actions">
                <button className="action-btn approve" title="Approve" onClick={() => handleApprove(review.id)}>✓ Approve</button>
                <button className="action-btn reject" title="Reject" onClick={() => handleReject(review.id)}>✗ Reject</button>
                <button className="action-btn edit" title="Edit" onClick={() => handleEdit(review.id)}>✏️ Edit</button>
                <button className="action-btn delete" title="Delete" onClick={() => handleDelete(review.id)}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="no-results">
          <p>No reviews found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default RatingsReviews

