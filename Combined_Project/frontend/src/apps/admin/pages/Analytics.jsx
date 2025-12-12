import { useState, useEffect } from 'react'
import './Analytics.css'

const Analytics = () => {
  const chartData = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 78 },
    { month: 'Mar', value: 90 },
    { month: 'Apr', value: 81 },
    { month: 'May', value: 95 },
    { month: 'Jun', value: 88 },
  ]

  const topPages = [
    { page: '/dashboard', views: 12450, change: '+12%' },
    { page: '/products', views: 8920, change: '+8%' },
    { page: '/about', views: 5430, change: '-3%' },
    { page: '/contact', views: 3210, change: '+15%' },
  ]

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${apiBase}/admin/summary`)
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchMetrics()
  }, [])

  const maxValue = chartData && chartData.length > 0
    ? Math.max(...chartData.map(d => d.value || 0))
    : 100

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Analytics & Reports</h2>
        <p>Track performance and user engagement metrics</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card chart-card">
          <h3>Monthly Traffic</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {chartData.map((data, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                    title={`${data.value}K`}
                  >
                    <span className="chart-value">{data.value}K</span>
                  </div>
                  <span className="chart-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Key Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <div className="metric-info">
                <span className="metric-label">Total Users</span>
                <span className="metric-value">{metrics ? metrics.total_users : '...'}</span>
              </div>
              <span className="metric-change positive">Workers: {metrics ? metrics.total_workers : 0}</span>
            </div>
            <div className="metric-item">
              <div className="metric-info">
                <span className="metric-label">Total Bookings</span>
                <span className="metric-value">{metrics ? metrics.total_bookings : '...'}</span>
              </div>
              <span className="metric-change positive">Clients: {metrics ? metrics.total_clients : 0}</span>
            </div>
            <div className="metric-item">
              <div className="metric-info">
                <span className="metric-label">Total Reviews</span>
                <span className="metric-value">{metrics ? metrics.total_reviews : '...'}</span>
              </div>
              <span className="metric-change positive">+0.0%</span>
            </div>
            <div className="metric-item">
              <div className="metric-info">
                <span className="metric-label">System Status</span>
                <span className="metric-value">Active</span>
              </div>
              <span className="metric-change positive">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h3>Top Pages</h3>
        <div className="top-pages-list">
          {topPages.map((page, index) => (
            <div key={index} className="page-item">
              <div className="page-rank">#{index + 1}</div>
              <div className="page-info">
                <span className="page-path">{page.page}</span>
                <span className="page-views">{page.views.toLocaleString()} views</span>
              </div>
              <span className={`page-change ${page.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {page.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Traffic Sources</h3>
          <div className="traffic-sources">
            <div className="source-item">
              <div className="source-bar">
                <div className="source-fill" style={{ width: '45%' }}></div>
              </div>
              <div className="source-info">
                <span>Direct</span>
                <span>45%</span>
              </div>
            </div>
            <div className="source-item">
              <div className="source-bar">
                <div className="source-fill" style={{ width: '30%' }}></div>
              </div>
              <div className="source-info">
                <span>Search</span>
                <span>30%</span>
              </div>
            </div>
            <div className="source-item">
              <div className="source-bar">
                <div className="source-fill" style={{ width: '15%' }}></div>
              </div>
              <div className="source-info">
                <span>Social</span>
                <span>15%</span>
              </div>
            </div>
            <div className="source-item">
              <div className="source-bar">
                <div className="source-fill" style={{ width: '10%' }}></div>
              </div>
              <div className="source-info">
                <span>Referral</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Device Breakdown</h3>
          <div className="device-stats">
            <div className="device-item">
              <span className="device-icon">💻</span>
              <div className="device-details">
                <span>Desktop</span>
                <span className="device-percent">58%</span>
              </div>
            </div>
            <div className="device-item">
              <span className="device-icon">📱</span>
              <div className="device-details">
                <span>Mobile</span>
                <span className="device-percent">35%</span>
              </div>
            </div>
            <div className="device-item">
              <span className="device-icon">📱</span>
              <div className="device-details">
                <span>Tablet</span>
                <span className="device-percent">7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

