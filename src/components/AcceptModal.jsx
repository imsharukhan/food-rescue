import { useState }   from 'react'
import { X, Users, Building2 } from 'lucide-react'
import { useApp }     from '../context/AppContext'

export default function AcceptModal({ post, onClose, onDone }) {
  const { respond } = useApp()
  const [form, setForm] = useState({
    name:  localStorage.getItem('fr_ngo') || '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const confirm = () => {
    if (!form.name.trim()) { setErr('NGO name is required'); return }
    setLoading(true)
    respond(post.id, 'accept', form)
    localStorage.setItem('fr_ngo', form.name)
    setTimeout(() => { setLoading(false); onDone() }, 400)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>Confirm Pickup</h3>
          <button className="modal-x" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="modal-preview">
          {post.photo && <img src={post.photo} className="modal-img" alt={post.food_name} />}
          <div>
            <p className="modal-fname">{post.food_name}</p>
            <p className="modal-fmeta"><Users size={12} /> ~{post.ai_servings} servings · {post.quantity}</p>
            <p className="modal-fmeta"><Building2 size={12} /> {post.hotel_name}</p>
          </div>
        </div>

        <div className="field">
          <label>Your NGO Name *</label>
          <input name="name" value={form.name} onChange={set} placeholder="e.g. Feeding India" autoFocus />
        </div>
        <div className="field">
          <label>Contact Number</label>
          <input name="phone" value={form.phone} onChange={set} placeholder="+91 98765 43210" />
        </div>

        {err && <p className="modal-err">⚠️ {err}</p>}

        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-ok" onClick={confirm} disabled={loading}>
            {loading ? 'Confirming...' : '✅ Confirm Pickup'}
          </button>
        </div>
      </div>
    </div>
  )
}