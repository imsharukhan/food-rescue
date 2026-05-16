import { Clock, MapPin, Package, CheckCircle, XCircle, Leaf, Drumstick } from 'lucide-react'

const STATUS = {
  available: { label: 'Live',     bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', color: '#16a34a', dot: '#22c55e', border: '#bbf7d0' },
  accepted:  { label: 'Accepted', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', color: '#2563eb', dot: '#3b82f6', border: '#bfdbfe' },
  declined:  { label: 'Declined', bg: 'linear-gradient(135deg,#fef2f2,#fee2e2)', color: '#dc2626', dot: '#ef4444', border: '#fecaca' },
}

const COND_COLOR = { good: '#10b981', bad: '#ef4444' }

const TYPE_ICON  = { veg: '🥬', 'non-veg': '🍗', mixed: '🍱' }
const TYPE_COLOR = { veg: '#16a34a', 'non-veg': '#dc2626', mixed: '#d97706' }
const TYPE_BG    = { veg: '#f0fdf4', 'non-veg': '#fef2f2', mixed: '#fffbeb' }

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function PostCard({ post }) {
  const cfg       = STATUS[post.status] || STATUS.available
  const condColor = COND_COLOR[post.ai_condition] || '#94a3b8'
  const typeColor = TYPE_COLOR[post.ai_food_type] || '#64748b'
  const typeBg    = TYPE_BG[post.ai_food_type]    || '#f8fafc'

  return (
    <div className="pcard" style={{
      borderLeft: `3px solid ${cfg.dot}`,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)',
      overflow: 'hidden',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1), 0 8px 28px rgba(0,0,0,.07)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)'
      }}
    >

      {/* ── Header: photo + name + badge ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 14px 0' }}>

        {/* Left: thumb + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
          {post.photo
            ? <img src={post.photo} alt={post.food_name} style={{
                width: 52, height: 52, borderRadius: 10, objectFit: 'cover',
                flexShrink: 0, border: '2px solid #f1f5f9',
              }} />
            : <div style={{
                width: 52, height: 52, borderRadius: 10, background: 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>🍱</div>
          }
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 14.5, fontWeight: 700, color: '#0f172a',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>{post.food_name}</p>
            <p style={{
              margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: '#64748b', fontWeight: 500,
            }}>
              <Package size={11} color="#94a3b8" />
              {post.quantity}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          fontSize: 11.5, fontWeight: 600, color: cfg.color,
          flexShrink: 0, marginLeft: 8,
          letterSpacing: '0.01em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: cfg.dot,
            boxShadow: cfg.dot === '#22c55e' ? `0 0 0 2px #bbf7d080` : 'none',
            animation: post.status === 'available' ? 'pulse 2s ease infinite' : 'none',
          }} />
          {cfg.label}
        </span>
      </div>

      {/* ── AI chips ─────────────────────────────────────────────── */}
      {post.ai_condition && (
        <div style={{ display: 'flex', gap: 7, padding: '10px 14px 0', flexWrap: 'wrap' }}>

          {/* Condition chip */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 20,
            background: post.ai_condition === 'good' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${post.ai_condition === 'good' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: 11.5, fontWeight: 600, color: condColor,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: condColor }} />
            {post.ai_condition === 'good' ? 'Good' : 'Poor'} condition
          </span>

          {/* Food type chip */}
          {post.ai_food_type && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 20,
              background: typeBg, border: `1px solid ${typeColor}28`,
              fontSize: 11.5, fontWeight: 600, color: typeColor,
              textTransform: 'capitalize',
            }}>
              {TYPE_ICON[post.ai_food_type]} {post.ai_food_type}
            </span>
          )}
        </div>
      )}

      {/* ── Accepted info ─────────────────────────────────────────── */}
      {post.status === 'accepted' && post.ngo_name && (
        <div style={{
          margin: '10px 14px 0',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 11px', borderRadius: 9,
          background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
          border: '1px solid #bfdbfe',
        }}>
          <CheckCircle size={13} color="#2563eb" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: '#1e40af', fontWeight: 500 }}>
            Picked up by{' '}
            <strong style={{ fontWeight: 700 }}>{post.ngo_name}</strong>
            {post.ngo_phone && (
              <span style={{ color: '#3b82f6', marginLeft: 5 }}>· {post.ngo_phone}</span>
            )}
          </span>
        </div>
      )}

      {/* ── Declined info ─────────────────────────────────────────── */}
      {post.status === 'declined' && (
        <div style={{
          margin: '10px 14px 0',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 11px', borderRadius: 9,
          background: 'linear-gradient(135deg,#fef2f2,#fee2e2)',
          border: '1px solid #fecaca',
        }}>
          <XCircle size={13} color="#dc2626" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: '#b91c1c', fontWeight: 500 }}>
            Declined by NGO — consider reposting with updated details
          </span>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px 13px',
        borderTop: '1px solid #f1f5f9',
        marginTop: 10,
      }}>
        <Clock size={10} color="#cbd5e1" />
        <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>{timeAgo(post.created_at)}</span>
        {post.hotel_address && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
            <MapPin size={10} color="#cbd5e1" style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: 11.5, color: '#94a3b8', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{post.hotel_address}</span>
          </>
        )}
      </div>

      {/* Pulse keyframe for live dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}