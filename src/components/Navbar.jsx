import { useState } from 'react'
import { Bell, Hotel, HandHeart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import NotificationPanel from './NotificationPanel'

export default function Navbar({ role, setRole }) {
  const { unread }      = useApp()
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-logo">
          <span>🍱</span>
        </div>
        <div>
          <p className="nav-title">FoodRescue</p>
          <p className="nav-sub">Connecting surplus to need</p>
        </div>
      </div>

      <div className="nav-right">
        <button className="bell-btn" onClick={() => setOpen(v => !v)}>
          <Bell size={18} strokeWidth={2} />
          {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>

        <div className={`toggle-pill tp--${role}`}>
          <button className={`tp-opt ${role === 'hotel' ? 'tp-opt--on' : ''}`} onClick={() => setRole('hotel')}>
            <Hotel size={14} strokeWidth={2.5} />
            Hotel
          </button>
          <button className={`tp-opt ${role === 'ngo' ? 'tp-opt--on' : ''}`} onClick={() => setRole('ngo')}>
            <HandHeart size={14} strokeWidth={2.5} />
            NGO
          </button>
        </div>
      </div>

      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </nav>
  )
}