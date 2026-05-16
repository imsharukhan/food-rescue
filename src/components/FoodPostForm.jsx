import { useState } from 'react'
import { Upload, Sparkles, RefreshCw, Rocket, Leaf, AlertTriangle, FileImage, X } from 'lucide-react'
import { analyseFood, compressImage } from '../utils/clarifai'
import { useApp } from '../context/AppContext'

const EXPIRY = [
  { label: '30 minutes', v: 30  },
  { label: '1 hour',     v: 60  },
  { label: '2 hours',    v: 120 },
  { label: '3 hours',    v: 180 },
  { label: '6 hours',    v: 360 },
  { label: '12 hours',   v: 720 },
]

const COND_COLOR = { good: '#10b981', bad: '#ef4444' }
const BLANK = {
  hotel_name: localStorage.getItem('fr_hotel') || '',
  hotel_address: '', hotel_phone: '',
  food_name: '', description: '', quantity: '', expiry_mins: 120,
}

const formatFileSize = bytes => {
  if (!bytes) return ''
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileExt = name =>
  name ? name.split('.').pop().toUpperCase().slice(0, 4) : 'IMG'

export default function FoodPostForm() {
  const { addPost }           = useApp()
  const [form, setForm]       = useState(BLANK)
  const [imgData, setImgData] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [ai, setAi]           = useState({ state: 'idle', result: null, err: '' })
  const [done, setDone]       = useState(false)

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const clearFile = () => {
    setImgData(null)
    setFileInfo(null)
    setAi({ state: 'idle', result: null, err: '' })
  }

  const onFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setAi({ state: 'idle', result: null, err: '' })
    setFileInfo({ name: file.name, size: file.size })
    try {
      setImgData(await compressImage(file))
    } catch (err) {
      setFileInfo(null)
      setAi(a => ({ ...a, err: 'Could not load this image. Please try a JPG or PNG photo.' }))
    }
    // Reset input so same file can be re-selected after removal
    e.target.value = ''
  }

  const analyse = async () => {
    if (!imgData)        return setAi(a => ({ ...a, err: 'Upload a food photo first.' }))
    if (!form.food_name) return setAi(a => ({ ...a, err: 'Enter the food name first.' }))
    if (!form.quantity)  return setAi(a => ({ ...a, err: 'Enter the quantity first.' }))
    setAi({ state: 'loading', result: null, err: '' })
    try {
      const r = await analyseFood({ ...imgData, foodName: form.food_name, quantity: form.quantity, expiryMins: form.expiry_mins })
      setAi({ state: 'done', result: r, err: '' })
    } catch (e) {
      setAi({ state: 'error', result: null, err: e.message || 'AI analysis failed. Check your API key.' })
    }
  }

  const submit = () => {
    if (!ai.result?.is_safe) return
    addPost({ ...form, photo: imgData.dataUrl, ai_safe: ai.result.is_safe, ai_food_type: ai.result.food_type, ai_condition: ai.result.condition, ai_notes: ai.result.notes })
    localStorage.setItem('fr_hotel', form.hotel_name)
    setForm(f => ({ ...f, food_name: '', description: '', quantity: '', expiry_mins: 120 }))
    setImgData(null)
    setFileInfo(null)
    setAi({ state: 'idle', result: null, err: '' })
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div className="pform">

      {/* Hotel info */}
      <p className="field-sec">Hotel Information</p>
      <div className="frow">
        <div className="field">
          <label>Hotel Name *</label>
          <input name="hotel_name" value={form.hotel_name} onChange={set} placeholder="e.g. Hotel Grand" />
        </div>
        <div className="field">
          <label>Phone Number</label>
          <input name="hotel_phone" value={form.hotel_phone} onChange={set} placeholder="+91 98765 43210" />
        </div>
      </div>
      <div className="field">
        <label>Full Address *</label>
        <input name="hotel_address" value={form.hotel_address} onChange={set} placeholder="Street, Area, City" />
      </div>

      {/* Food info */}
      <p className="field-sec">Food Details</p>
      <div className="frow">
        <div className="field">
          <label>Food Name *</label>
          <input name="food_name" value={form.food_name} onChange={set} placeholder="e.g. Chicken Biryani" />
        </div>
        <div className="field">
          <label>Quantity *</label>
          <input name="quantity" value={form.quantity} onChange={set} placeholder="e.g. 5 kg / 30 plates" />
        </div>
      </div>
      <div className="field">
        <label>Additional Notes</label>
        <textarea name="description" value={form.description} onChange={set} placeholder="Allergens, packaging info, special handling..." rows={2} />
      </div>
      <div className="field">
        <label>Food is safe for</label>
        <select name="expiry_mins" value={form.expiry_mins} onChange={set}>
          {EXPIRY.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
      </div>

      {/* Photo upload */}
      <p className="field-sec">Food Photo</p>
      {!imgData ? (
        <label className="photo-drop">
          <div className="photo-hint">
            <div className="photo-ic"><Upload size={24} strokeWidth={1.5} /></div>
            <p className="photo-main">Click to upload food photo</p>
            <p className="photo-sub">JPG or PNG · Auto-compressed to 800 px</p>
          </div>
          <input type="file" accept="image/*" onChange={onFile} hidden />
        </label>
      ) : (
        <div className="file-attached">
          <div className="file-attached-left">
            <div className="file-attached-ic">
              <FileImage size={18} />
              <span className="file-ext-badge">{getFileExt(fileInfo?.name)}</span>
            </div>
            <div className="file-attached-info">
              <span className="file-attached-name">{fileInfo?.name}</span>
              <span className="file-attached-meta">
                <span className="file-size-txt">{formatFileSize(fileInfo?.size)}</span>
                <span className="file-sep" />
                <span className="file-ready-dot" />
                <span className="file-ready-txt">Ready for AI screening</span>
              </span>
            </div>
          </div>
          <div className="file-attached-actions">
            <label className="file-change-btn">
              <Upload size={12} />
              Change
              <input type="file" accept="image/*" onChange={onFile} hidden />
            </label>
            <button className="file-remove-btn" onClick={clearFile} title="Remove photo" aria-label="Remove photo">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {ai.err && (
        <div className="form-err">
          <AlertTriangle size={14} /> {ai.err}
        </div>
      )}

      {/* Analyse button */}
      {ai.state !== 'done' && (
        <button className="btn-analyse" onClick={analyse} disabled={ai.state === 'loading'}>
          {ai.state === 'loading'
            ? <><span className="spin" /> Clarify AI is analysing...</>
            : <><Sparkles size={16} /> Analyse with Clarify AI</>
          }
        </button>
      )}

      {/* AI result */}
      {ai.result && (
        <div style={{
          borderRadius: 14,
          border: `1.5px solid ${ai.result.is_safe ? '#6ee7b7' : '#fca5a5'}`,
          background: ai.result.is_safe
            ? 'linear-gradient(135deg,#f0fdf4,#ecfdf5)'
            : 'linear-gradient(135deg,#fff5f5,#fef2f2)',
          overflow: 'hidden',
          marginTop: 16,
          animation: 'fadeSlideUp .25s ease',
        }}>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{ai.result.is_safe ? '✅' : '❌'}</span>
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color: ai.result.is_safe ? '#065f46' : '#991b1b' }}>
                  {ai.result.is_safe ? 'Safe to Donate' : 'Not Safe to Donate'}
                </p>
                <p style={{ margin:0, fontSize:11, color: ai.result.is_safe ? '#6ee7b7' : '#fca5a5', fontWeight:500 }}>
                  Clarifai AI Analysis
                </p>
              </div>
            </div>
            <button
              onClick={() => setAi({ state:'idle', result:null, err:'' })}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:8,
                background:'rgba(255,255,255,.7)', border:'1px solid rgba(0,0,0,.1)',
                fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}
            >
              <RefreshCw size={12} /> Re-analyse
            </button>
          </div>

          {/* Type + Condition chips */}
          {ai.result.is_safe && (
            <div style={{ display:'flex', gap:8, padding:'10px 16px 0', flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600,
                background:'rgba(255,255,255,.8)', border:'1px solid rgba(0,0,0,.08)',
                color:'#374151', textTransform:'capitalize' }}>
                <Leaf size={12} color="#10b981" /> {ai.result.food_type}
              </span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600,
                background:'rgba(255,255,255,.8)', border:'1px solid rgba(0,0,0,.08)',
                color: COND_COLOR[ai.result.condition] || '#374151', textTransform:'capitalize' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background: COND_COLOR[ai.result.condition] || '#94a3b8' }} />
                {ai.result.condition} condition
              </span>
            </div>
          )}

          {/* Clean note — no raw labels */}
          <p style={{ margin:0, padding:'10px 16px 14px', fontSize:12.5, lineHeight:1.5,
            color: ai.result.is_safe ? '#065f46' : '#991b1b', fontWeight:500 }}>
            🤖 {ai.result.notes}
          </p>
        </div>
      )}

      {ai.result?.is_safe && (
        <button className="btn-post" onClick={submit} disabled={done}>
          {done
            ? '✅ Posted! Now visible to all NGOs'
            : <><Rocket size={16} /> Post for Donation</>
          }
        </button>
      )}

      {ai.result && !ai.result.is_safe && (
        <div className="unsafe-msg">
          <AlertTriangle size={15} />
          This food cannot be posted. Please ensure it before donating.
        </div>
      )}
    </div>
  )
}