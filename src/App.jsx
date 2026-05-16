import { useState, useCallback } from 'react'
import { AppProvider }   from './context/AppContext'
import HotelDashboard   from './components/HotelDashboard'
import NgoDashboard     from './components/NgoDashboard'
import Toast            from './components/Toast'
import './App.css'

export default function App() {
  const [role,   setRole]   = useState('hotel')
  const [toasts, setToasts] = useState([])

  const showToast = useCallback(({ msg, type = 'success' }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  return (
    <AppProvider showToast={showToast}>
      <div className="app">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="app-header">
          <div className="app-brand">
            <div className="brand-orb">🍱</div>
            <div className="brand-text">
              <p className="brand-name">FoodRescue</p>
              <p className="brand-sub">Zero Waste · Real Impact</p>
            </div>
          </div>

          {/* Segmented toggle */}
          <div className="seg-wrap" role="group" aria-label="Switch dashboard">
            <button
              className={`seg-btn ${role === 'hotel' ? 'seg-btn--on seg-btn--hotel' : ''}`}
              onClick={() => setRole('hotel')}
            >
              <span>🏨</span><span>Hotel</span>
            </button>
            <button
              className={`seg-btn ${role === 'ngo' ? 'seg-btn--on seg-btn--ngo' : ''}`}
              onClick={() => setRole('ngo')}
            >
              <span>🤝</span><span>NGO</span>
            </button>
          </div>
        </header>

        {/* Context strip */}
        <div className={`role-strip ${role === 'ngo' ? 'role-strip--ngo' : 'role-strip--hotel'}`}>
          {role === 'hotel'
            ? '🏨 Hotel Dashboard — Post surplus food for donation'
            : '🤝 NGO Dashboard — Browse & accept available donations'}
        </div>

        <main className="main">
          {role === 'hotel' ? <HotelDashboard /> : <NgoDashboard />}
        </main>
      </div>

      <div className="toast-rack">
        {toasts.map(t => <Toast key={t.id} t={t} />)}
      </div>
    </AppProvider>
  )
}