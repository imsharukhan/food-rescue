import { useEffect } from 'react'
import { X, CheckCircle2, BellOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ago = d => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m/60)}h ago`
  return `${Math.floor(m/1440)}d ago`
}

export default function NotificationPanel({ onClose }) {
  const { notifs, markRead } = useApp()
  useEffect(() => { markRead() }, [])

  return (
    <>
      <div className="np-bg" onClick={onClose} />
      <div className="np">
        <div className="np-hd">
          <p className="np-title">Notifications</p>
          <button className="np-close" onClick={onClose}><X size={14} /></button>
        </div>

        {notifs.length === 0
          ? <div className="np-nil">
              <BellOff size={32} strokeWidth={1.5} />
              <p>No notifications yet</p>
            </div>
          : <div className="np-list">
              {notifs.map(n => (
                <div key={n.id} className="np-row">
                  <div className="np-ic"><CheckCircle2 size={18} /></div>
                  <div>
                    <p className="np-msg">{n.message}</p>
                    <p className="np-time">{ago(n.at)}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </>
  )
}