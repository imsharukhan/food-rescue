import { useState, useEffect } from 'react'
import { MapPin, Phone, Package, Users, Clock } from 'lucide-react'
import { useApp }    from '../context/AppContext'
import AcceptModal   from './AcceptModal'

const COND_STYLE = {
  good: { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0', dot:'#22c55e' },
  bad:  { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', dot:'#ef4444' },
}
const TYPE_STYLE = {
  veg:       { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', label:'🥬 Veg'     },
  'non-veg': { bg:'#fff5f5', color:'#dc2626', border:'#fecaca', label:'🍗 Non-Veg' },
  mixed:     { bg:'#fffbeb', color:'#b45309', border:'#fde68a', label:'🍱 Mixed'   },
}

function useCountdown(createdAt, expiryMins) {
  const calc = () => {
    const ms = new Date(createdAt).getTime() + expiryMins * 60000 - Date.now()
    if (ms <= 0) return null
    const m = Math.floor(ms / 60000)
    return m < 60 ? `${m}m left` : `${Math.floor(m / 60)}h ${m % 60}m left`
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 30000)
    return () => clearInterval(id)
  }, [createdAt, expiryMins])
  return t
}

export default function FoodCard({ post }) {
  const { respond }       = useApp()
  const [modal, setModal] = useState(false)
  const countdown         = useCountdown(post.created_at, post.expiry_mins)
  const expired           = !countdown
  const cond = COND_STYLE[post.ai_condition] || COND_STYLE.good
  const type = TYPE_STYLE[post.ai_food_type]

  return (
    <>
      <div className={`fcard2 ${expired ? 'fcard2--exp' : ''}`}>

        {/* ── Image ───────────────────────────────────── */}
        <div className="fcard2-imgwrap">
          {post.photo
            ? <img src={post.photo} className="fcard2-img" alt={post.food_name} />
            : <div className="fcard2-noimg">🍱</div>
          }
          <div className={`fcard2-timer ${expired ? 'fcard2-timer--exp' : ''}`}>
            <Clock size={10} /> {expired ? 'Expired' : countdown}
          </div>
          {type && (
            <div className="fcard2-typepin"
              style={{ background: type.bg, color: type.color, border: `1px solid ${type.border}` }}>
              {type.label}
            </div>
          )}
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="fcard2-body">
          <h3 className="fcard2-name">{post.food_name}</h3>

          <div className="fcard2-inforow">
            <span className="fcard2-hotel">🏨 {post.hotel_name}</span>
          </div>
          <div className="fcard2-inforow">
            <MapPin size={11} className="fcard2-ic" />
            <span>{post.hotel_address}</span>
          </div>
          {post.hotel_phone && (
            <div className="fcard2-inforow">
              <Phone size={11} className="fcard2-ic" />
              <span>{post.hotel_phone}</span>
            </div>
          )}

          <div className="fcard2-chips">
            {post.ai_condition && (
              <span className="fcard2-chip"
                style={{ background: cond.bg, color: cond.color, border: `1px solid ${cond.border}` }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background: cond.dot }} />
                {post.ai_condition}
              </span>
            )}
            <span className="fcard2-chip fcard2-chip--srv">
              <Users size={10} /> ~{post.ai_servings ?? '?'} servings
            </span>
            <span className="fcard2-chip fcard2-chip--qty">
              <Package size={10} /> {post.quantity}
            </span>
          </div>

          {post.ai_notes && (
            <div className="fcard2-ainote">
              🤖 {post.ai_notes}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="fcard2-foot">
          <button
            className={`fcard2-accept ${expired ? 'fcard2-accept--dis' : ''}`}
            onClick={() => !expired && setModal(true)}
            disabled={expired}
          >
            {expired ? 'Expired' : '✅ Accept Pickup'}
          </button>
          <button className="fcard2-decline" onClick={() => respond(post.id, 'decline', {})}>
            Decline
          </button>
        </div>
      </div>

      {modal && (
        <AcceptModal post={post} onClose={() => setModal(false)} onDone={() => setModal(false)} />
      )}
    </>
  )
}