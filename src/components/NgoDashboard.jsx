import { useState, useEffect } from 'react'
import {
  Salad, Drumstick, UtensilsCrossed, LayoutGrid,
  Bell, Phone, MapPin, Clock, CheckCircle2,
  XCircle, Package, Truck, History,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import FoodCard  from './FoodCard'

/* ── helpers ────────────────────────────────────────────── */
function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function useCountdown(expiresAt) {
  const calc = () => {
    const diff = new Date(expiresAt) - Date.now()
    if (!expiresAt || diff <= 0) return 'Expired'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return h > 0 ? `${h}h ${m}m left` : `${m}m ${s}s left`
  }
  const [remaining, setRemaining] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return remaining
}

const imgSrc = (b64) =>
  !b64 ? null : b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`

const TYPE_COLORS = {
  veg:     { bg: '#f0fdf4', fg: '#16a34a', border: '#bbf7d0' },
  'non-veg': { bg: '#fff5f5', fg: '#dc2626', border: '#fecaca' },
  mixed:   { bg: '#fffbeb', fg: '#d97706', border: '#fde68a' },
}

const FILTERS = [
  { key: 'all',     icon: <LayoutGrid size={13} />,      label: 'All'     },
  { key: 'veg',     icon: <Salad size={13} />,           label: 'Veg'     },
  { key: 'non-veg', icon: <Drumstick size={13} />,       label: 'Non-Veg' },
  { key: 'mixed',   icon: <UtensilsCrossed size={13} />, label: 'Mixed'   },
]

/* ── Active Pickup Card ─────────────────────────────────── */
function ActivePickupCard({ post }) {
  const { markPickedUp, cancelPickup } = useApp()
  const countdown = useCountdown(post.expires_at)
  const isExpired = post.expires_at && new Date(post.expires_at) < Date.now()
  const tc        = TYPE_COLORS[post.ai_food_type] || { bg: '#f3f4f6', fg: '#6b7280', border: '#e5e7eb' }
  const photo     = imgSrc(post.image_b64)

  return (
    <div className={`pc ${isExpired ? 'pc--expired' : ''}`}>

      {/* header */}
      <div className="pc-head">
        <div className="pc-imgwrap">
          {photo
            ? <img src={photo} alt={post.food_name} className="pc-img" />
            : <div className="pc-img-nil">🍽️</div>}
          <span className={`pc-cd ${isExpired ? 'pc-cd--exp' : ''}`}>
            <Clock size={10} /> {countdown}
          </span>
        </div>
        <div className="pc-headinfo">
          <h3 className="pc-name">{post.food_name}</h3>
          <div className="pc-chips">
            <span className="pc-chip pc-chip--active">🚚 Active Pickup</span>
            {post.ai_food_type && (
              <span className="pc-chip" style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}>
                {post.ai_food_type}
              </span>
            )}
            {post.ai_condition && (
              <span className="pc-chip pc-chip--cond">{post.ai_condition}</span>
            )}
          </div>
          {post.accepted_at && (
            <p className="pc-ts">Accepted {timeAgo(post.accepted_at)}</p>
          )}
        </div>
      </div>

      {/* info rows */}
      <div className="pc-body">
        <div className="pc-row pc-row--2">
          <div className="pc-info">
            <span className="pc-info-ic">🏨</span>
            <div><p className="pc-lbl">Hotel</p><p className="pc-val">{post.hotel_name || '—'}</p></div>
          </div>
          <div className="pc-info">
            <Package size={13} className="pc-info-ic" />
            <div><p className="pc-lbl">Quantity</p><p className="pc-val">{post.quantity || `~${post.ai_servings || '?'} servings`}</p></div>
          </div>
        </div>
        <div className="pc-info">
          <MapPin size={13} className="pc-info-ic" />
          <div><p className="pc-lbl">Address</p><p className="pc-val">{post.address || '—'}</p></div>
        </div>
        <div className="pc-info">
          <Phone size={13} className="pc-info-ic" />
          <div><p className="pc-lbl">Phone</p><p className="pc-val">{post.phone || '—'}</p></div>
        </div>
      </div>

      {/* actions */}
      <div className="pc-actions">
        <a href={`tel:${post.phone}`} className="pc-btn pc-btn--call">
          <Phone size={12} /> Call Hotel
        </a>
        <button className="pc-btn pc-btn--done" onClick={() => markPickedUp(post.id)}>
          <CheckCircle2 size={12} /> Mark as Picked Up
        </button>
        <button className="pc-btn pc-btn--cancel" onClick={() => cancelPickup(post.id)}>
          <XCircle size={12} /> Cancel
        </button>
      </div>
    </div>
  )
}

/* ── Completed Card ─────────────────────────────────────── */
function CompletedCard({ post }) {
  const photo = imgSrc(post.image_b64)
  return (
    <div className="cc">
      <div className="cc-left">
        {photo
          ? <img src={photo} alt={post.food_name} className="cc-img" />
          : <div className="cc-img-nil">✅</div>}
        <div>
          <p className="cc-name">{post.food_name}</p>
          <p className="cc-hotel">{post.hotel_name}</p>
          <p className="cc-time">Picked up {post.picked_up_at ? timeAgo(post.picked_up_at) : ''}</p>
        </div>
      </div>
      <span className="cc-badge">Completed</span>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function NgoDashboard() {
  const { available, activePosts, completedPosts, unread } = useApp()
  const [filter, setFilter] = useState('all')

  const visible      = filter === 'all' ? available : available.filter(p => p.ai_food_type === filter)
  const totalRescued = completedPosts.reduce((s, p) => s + (p.ai_servings || 0), 0)

  return (
    <div className="ndash">

      {/* ── Stats bar ───────────────────────────────────── */}
      <div className="ndash-stats">
        {[
          { n: available.length,   l: 'Available',     c: '#34d399', icon: <LayoutGrid size={16} /> },
          { n: activePosts.length, l: 'Active Pickups', c: '#60a5fa', icon: <Truck size={16} />      },
          { n: completedPosts.length, l: 'Completed',  c: '#a78bfa', icon: <History size={16} />    },
          { n: totalRescued,       l: 'Meals Rescued',  c: '#fbbf24', icon: <Package size={16} />   },
        ].map(({ n, l, c, icon }) => (
          <div className="ndash-stat" key={l}>
            <span className="ndash-stat-icon" style={{ color: c }}>{icon}</span>
            <p className="ndash-stat-n" style={{ color: c }}>{n}</p>
            <p className="ndash-stat-l">{l}</p>
          </div>
        ))}
      </div>

      {/* ── Available Donations ─────────────────────────── */}
      <div className="ndash-section">
        <div className="ndash-banner">
          <div className="ndash-banner-left">
            <p className="ndash-banner-title">Available Donations</p>
            <p className="ndash-banner-sub">
              Accept a donation — the hotel is notified <strong>instantly</strong>
            </p>
          </div>
          {unread > 0 && (
            <div className="ndash-kpis">
              <div className="ndash-kpi">
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <Bell size={14} style={{ color:'#fbbf24' }} />
                  <p className="ndash-kpi-n" style={{ color:'#fbbf24' }}>{unread}</p>
                </div>
                <p className="ndash-kpi-l">New</p>
              </div>
            </div>
          )}
        </div>

        <div className="ndash-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ndash-pill ${filter === f.key ? 'ndash-pill--on' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.icon} {f.label}
              {f.key !== 'all' && (
                <span className="ndash-pill-cnt">
                  {available.filter(p => p.ai_food_type === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {available.length === 0 ? (
          <div className="ndash-nil">
            <p className="ndash-nil-ic">🍽️</p>
            <h3>No donations yet</h3>
            <p>Hotels post AI-screened food here. Check back soon.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="ndash-nil">
            <p className="ndash-nil-ic">🔍</p>
            <h3>No {filter} food right now</h3>
            <p>Try a different filter above.</p>
          </div>
        ) : (
          <div className="ndash-grid">
            {visible.map(p => <FoodCard key={p.id} post={p} />)}
          </div>
        )}
      </div>

      {/* ── Active Pickups ──────────────────────────────── */}
      {activePosts.length > 0 && (
        <div className="ndash-section">
          <div className="ndash-sec-hdr">
            <div className="ndash-sec-hdr-left">
              <span className="ndash-sec-dot ndash-sec-dot--blue" />
              <h2 className="ndash-sec-title">Active Pickups</h2>
              <span className="ndash-sec-badge ndash-sec-badge--blue">{activePosts.length}</span>
            </div>
            <p className="ndash-sec-sub">Donations you've accepted — go collect them</p>
          </div>
          <div className="pickup-grid">
            {activePosts.map(p => <ActivePickupCard key={p.id} post={p} />)}
          </div>
        </div>
      )}

      {/* ── Completed Pickups ───────────────────────────── */}
      {completedPosts.length > 0 && (
        <div className="ndash-section">
          <div className="ndash-sec-hdr">
            <div className="ndash-sec-hdr-left">
              <span className="ndash-sec-dot ndash-sec-dot--green" />
              <h2 className="ndash-sec-title">Completed Pickups</h2>
              <span className="ndash-sec-badge ndash-sec-badge--green">{completedPosts.length}</span>
            </div>
            <p className="ndash-sec-sub">Successfully rescued donations</p>
          </div>
          <div className="cc-list">
            {completedPosts.map(p => <CompletedCard key={p.id} post={p} />)}
          </div>
        </div>
      )}

    </div>
  )
}