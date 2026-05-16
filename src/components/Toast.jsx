import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function Toast({ t }) {
  return (
    <div className={`toast toast--${t.type}`}>
      {t.type === 'success'
        ? <CheckCircle2 size={17} strokeWidth={2.5} />
        : <AlertCircle   size={17} strokeWidth={2.5} />
      }
      <span>{t.msg}</span>
    </div>
  )
}