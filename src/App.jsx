import { useState, useCallback, useEffect, useRef } from 'react'
import { AppProvider }      from './context/AppContext'
import { useApp }           from './context/AppContext'
import HotelDashboard       from './components/HotelDashboard'
import NgoDashboard         from './components/NgoDashboard'
import NotificationPanel    from './components/NotificationPanel'
import Toast                from './components/Toast'
import { Bell, ArrowRight } from 'lucide-react'
import './App.css'

/* ─────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ─────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────── */
function Counter({ to, suffix = '', active }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let current = 0
    const steps = 52
    const inc   = to / steps
    const id    = setInterval(() => {
      current += inc
      if (current >= to) { setVal(to); clearInterval(id) }
      else setVal(Math.floor(current))
    }, 1600 / steps)
    return () => clearInterval(id)
  }, [to, active])
  return <>{val.toLocaleString()}{suffix}</>
}

/* ─────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────── */
function LandingPage({ onEnter }) {
  const [heroRef,  heroVisible]  = useReveal(0.04)
  const [statsRef, statsVisible] = useReveal(0.18)
  const [howRef,   howVisible]   = useReveal(0.08)

  const metrics = [
    { val: 12400, suffix: '+', label: 'Meals rescued',      sub: 'across 14 cities'       },
    { val: 340,   suffix: '+', label: 'NGOs onboarded',     sub: 'and growing daily'       },
    { val: 8900,  suffix: '+', label: 'kg CO₂ prevented',   sub: 'from landfill waste'     },
    { val: 8,     suffix: 'm', label: 'Avg. response time', sub: 'from post to acceptance' },
  ]

  const steps = [
    {
      num: '01', glyph: '📸',
      title: 'Post in 2 minutes',
      desc: 'Upload a photo of surplus food. Clarifai AI verifies it\'s real, safe, and ready — no manual review, no delays.',
    },
    {
      num: '02', glyph: '🔔',
      title: 'NGOs are notified instantly',
      desc: 'Verified charities see your listing the moment it\'s live and accept with a single tap from their phone.',
    },
    {
      num: '03', glyph: '✅',
      title: 'Food gets rescued',
      desc: 'The NGO collects, the hotel gets confirmation. Every meal counted. Every kilogram of waste prevented.',
    },
  ]

  return (
    <div className="land">

      {/* ── Navbar ─────────────────────────────────── */}
      <header className="land-nav">
        <div className="land-brand">
          <div className="land-logomark">🍱</div>
          <span className="land-wordmark">FoodRescue</span>
        </div>
        <div className="land-live-pill">
          <span className="land-live-dot" />
          <span className="land-live-label">Platform live</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="land-hero" ref={heroRef}>

        {/* Left column */}
        <div className="land-hero-left">
          <div className={`land-hero-text reveal ${heroVisible ? 'reveal--in' : ''}`}>
            <p className="land-kicker">
              <span className="land-kicker-rule" />
              AI-Powered Food Rescue
            </p>
            <h1 className="land-headline">
              Rescue surplus&nbsp;food.<br />
              <em className="land-headline-em">Feed more lives.</em>
            </h1>
            <p className="land-lead">
              Connect hotels with NGOs in seconds. Every donation
              is AI-screened for safety — zero waste, zero risk.
            </p>
          </div>

          {/* CTA split panel */}
          <div
            className={`land-split reveal ${heroVisible ? 'reveal--in' : ''}`}
            style={{ transitionDelay: '140ms' }}
          >
            <button
              className="land-split-half land-split-half--h"
              onClick={() => onEnter('hotel')}
            >
              <div className="land-split-meta">
                <span className="land-split-icon">🏨</span>
                <div>
                  <p className="land-split-title">I'm a Hotel</p>
                  <p className="land-split-desc">Post surplus food, AI-screened instantly</p>
                </div>
              </div>
              <span className="land-split-enter">
                Enter <ArrowRight size={13} strokeWidth={2.5} className="land-split-arrow" />
              </span>
            </button>

            <div className="land-split-rule" />

            <button
              className="land-split-half land-split-half--n"
              onClick={() => onEnter('ngo')}
            >
              <div className="land-split-meta">
                <span className="land-split-icon">🤝</span>
                <div>
                  <p className="land-split-title">I'm an NGO</p>
                  <p className="land-split-desc">Browse verified donations, accept in one tap</p>
                </div>
              </div>
              <span className="land-split-enter">
                Enter <ArrowRight size={13} strokeWidth={2.5} className="land-split-arrow" />
              </span>
            </button>
          </div>

          {/* Scroll cue */}
          <div className={`land-scroll-cue reveal ${heroVisible ? 'reveal--in' : ''}`} style={{ transitionDelay: '320ms' }}>
            <span className="land-scroll-line" />
            <span className="land-scroll-txt">scroll to explore</span>
          </div>
        </div>

        {/* Right column — live activity visual */}
        <div
          className={`land-hero-right ${heroVisible ? 'land-hero-right--in' : ''}`}
          aria-hidden="true"
        >
          <div className="land-feed-shell">
            <div className="land-feed-header">
              <span className="land-feed-dot" />
              <span className="land-feed-label">Live activity</span>
            </div>

            <div className="land-ac land-ac--0">
              <div className="land-ac-left">
                <span className="land-ac-icon">🍱</span>
                <div>
                  <p className="land-ac-name">Hyderabad Biryani</p>
                  <p className="land-ac-meta">Taj Coromandel Hotel · 60 servings</p>
                </div>
              </div>
              <span className="land-ac-badge land-ac-badge--new">Just posted</span>
            </div>

            <div className="land-ac land-ac--1">
              <div className="land-ac-left">
                <span className="land-ac-icon">✅</span>
                <div>
                  <p className="land-ac-name">Pasta &amp; Focaccia</p>
                  <p className="land-ac-meta">CareFirst NGO accepted · 2m ago</p>
                </div>
              </div>
              <span className="land-ac-badge land-ac-badge--ok">Accepted</span>
            </div>

            <div className="land-ac land-ac--2">
              <div className="land-ac-left">
                <span className="land-ac-icon">📦</span>
                <div>
                  <p className="land-ac-name">Sourdough &amp; Pastries</p>
                  <p className="land-ac-meta">28 kg rescued · ~90 meals served</p>
                </div>
              </div>
              <span className="land-ac-badge land-ac-badge--done">Rescued</span>
            </div>

            <div className="land-feed-footer">
              <span className="land-feed-footer-dot" />
              <span className="land-feed-footer-dot" />
              <span className="land-feed-footer-dot land-feed-footer-dot--on" />
              <span className="land-feed-footer-txt">Updated moments ago</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── Impact Numbers ─────────────────────────── */}
      <section className="land-numbers" ref={statsRef} aria-label="Impact metrics">
        <div className="land-numbers-inner">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`land-num reveal ${statsVisible ? 'reveal--in' : ''}`}
              style={{ transitionDelay: `${i * 65}ms` }}
            >
              <p className="land-num-val">
                <Counter to={m.val} suffix={m.suffix} active={statsVisible} />
              </p>
              <p className="land-num-label">{m.label}</p>
              <p className="land-num-sub">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section className="land-how" ref={howRef}>
        <div className={`land-how-hd reveal ${howVisible ? 'reveal--in' : ''}`}>
          <p className="land-section-kicker">
            <span className="land-kicker-rule" />
            Process
          </p>
          <h2 className="land-section-h2">Three steps to zero waste</h2>
          <p className="land-section-sub">From hotel kitchen to NGO table in under an hour</p>
        </div>

        <div className="land-steps">
          {steps.map((s, i) => (
            <article
              key={s.num}
              className={`land-step reveal ${howVisible ? 'reveal--in' : ''}`}
              style={{ transitionDelay: `${i * 80 + 100}ms` }}
            >
              <header className="land-step-hd">
                <span className="land-step-num">{s.num}</span>
                <span className="land-step-glyph">{s.glyph}</span>
              </header>
              <h3 className="land-step-title">{s.title}</h3>
              <p className="land-step-body">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="land-foot">
        <div className="land-foot-inner">
          <div className="land-brand">
            <div className="land-logomark land-logomark--sm">🍱</div>
            <span className="land-wordmark">FoodRescue</span>
          </div>
          <p className="land-foot-copy">
            Zero Waste · Zero Backend · Powered by Clarifai AI
          </p>
        </div>
      </footer>

    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   DASHBOARD SHELL
───────────────────────────────────────────────────────── */
function AppDashboard({ role, setRole, setView }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const { unread } = useApp()

  return (
    <div className="app">
      <header className="app-header">
        <button className="app-header-back" onClick={() => setView('landing')} aria-label="Back to landing">
          <div className="brand-orb">🍱</div>
          <div className="brand-text">
            <p className="brand-name">FoodRescue</p>
            <p className="brand-sub">Zero Waste · Real Impact</p>
          </div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="bell-btn"
            onClick={() => setNotifOpen(v => !v)}
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {unread > 0 && (
              <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

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
        </div>

        {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
      </header>

      <div className={`role-strip ${role === 'ngo' ? 'role-strip--ngo' : 'role-strip--hotel'}`}>
        {role === 'hotel'
          ? '🏨 Hotel Dashboard — Post surplus food for donation'
          : '🤝 NGO Dashboard — Browse & accept available donations'}
      </div>

      <main className="main">
        {role === 'hotel' ? <HotelDashboard /> : <NgoDashboard />}
      </main>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────── */
export default function App() {
  const [view,   setView]   = useState('landing')
  const [role,   setRole]   = useState('hotel')
  const [toasts, setToasts] = useState([])

  const showToast = useCallback(({ msg, type = 'success' }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  const handleEnter = (chosenRole) => {
    setRole(chosenRole)
    setView('dashboard')
  }

  return (
    <AppProvider showToast={showToast}>
      {view === 'landing'
        ? <LandingPage onEnter={handleEnter} />
        : <AppDashboard role={role} setRole={setRole} setView={setView} />
      }
      <div className="toast-rack">
        {toasts.map(t => <Toast key={t.id} t={t} />)}
      </div>
    </AppProvider>
  )
}