import { useState, useContext } from 'react'
import { ThemeContext } from '../App'
import './Settings.css'

const Settings = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext)
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoSave: true,
  })

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passForm, setPassForm] = useState({ userId: '', newPassword: '' })

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passForm.userId || !passForm.newPassword) return alert("Please fill all fields")

    try {
      // This is a simplified flow. Ideally we'd have auth middleware.
      // We are using a new endpoint PUT /users/:id/password
      const res = await fetch(`${apiBase}/users/${passForm.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passForm.newPassword })
      })

      if (res.ok) {
        alert("Password updated successfully")
        setShowPasswordModal(false)
        setPassForm({ userId: '', newPassword: '' })
      } else {
        const err = await res.json()
        alert("Failed: " + err.error)
      }
    } catch (err) {
      console.error(err)
      alert("Error changing password")
    }
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Site Name</h4>
                <p>Change your site's display name</p>
              </div>
              <input type="text" defaultValue="Admin Dashboard" className="setting-input" />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Site URL</h4>
                <p>Your site's base URL</p>
              </div>
              <input type="text" defaultValue="https://example.com" className="setting-input" />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Timezone</h4>
                <p>Select your timezone</p>
              </div>
              <select className="setting-input">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>GMT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Receive push notifications for important updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Alerts</h4>
                <p>Get notified via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Auto Save</h4>
                <p>Automatically save changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Switch to dark theme</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <select className="setting-input">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security</p>
              </div>
              <button className="action-button">Enable 2FA</button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Change Password</h4>
                <p>Update your account password</p>
              </div>
              <button className="action-button" onClick={() => setShowPasswordModal(true)}>Change Password</button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Active Sessions</h4>
                <p>Manage your active sessions</p>
              </div>
              <button className="action-button" onClick={() => alert("Active Sessions: Current Session (Windows Chrome) - Active")}>View Sessions</button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-button" onClick={() => alert("Settings Saved!")}>Save Changes</button>
        <button className="cancel-button">Cancel</button>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form className="modal-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="number"
                  placeholder="Enter User ID"
                  value={passForm.userId}
                  onChange={e => setPassForm({ ...passForm, userId: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

