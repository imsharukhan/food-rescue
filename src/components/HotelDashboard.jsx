import { Megaphone, CheckCheck, Sparkles } from 'lucide-react'
import { useApp }    from '../context/AppContext'
import FoodPostForm  from './FoodPostForm'
import PostCard      from './PostCard'

export default function HotelDashboard() {
  const { posts } = useApp()
  const accepted  = posts.filter(p => p.status === 'accepted').length
  const declined  = posts.filter(p => p.status === 'declined').length

  return (
    <div className="hdash">

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="hdash-stats">
        <div className="hstat hstat--amber">
          <div className="hstat-icon">📋</div>
          <div>
            <p className="hstat-n">{posts.length}</p>
            <p className="hstat-l">Total Posts</p>
          </div>
        </div>
        <div className="hstat hstat--green">
          <div className="hstat-icon"><CheckCheck size={18} /></div>
          <div>
            <p className="hstat-n">{accepted}</p>
            <p className="hstat-l">Accepted</p>
          </div>
        </div>
        {declined > 0 && (
          <div className="hstat hstat--red">
            <div className="hstat-icon">❌</div>
            <div>
              <p className="hstat-n">{declined}</p>
              <p className="hstat-l">Declined</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Body grid ────────────────────────────────────────────────────── */}
      <div className="hdash-grid">

        {/* Left: Post form */}
        <section className="hdash-col hdash-col--form">
          <div className="hdash-sec-hd">
            <div>
              <h2 className="hdash-sec-title">
                <Sparkles size={16} style={{ color: '#f59e0b' }} /> Post Surplus Food
              </h2>
              <p className="hdash-sec-sub">AI screens your photo before it reaches NGOs</p>
            </div>
          </div>
          <FoodPostForm />
        </section>

        {/* Right: My donations */}
        <section className="hdash-col hdash-col--posts">
          <div className="hdash-sec-hd">
            <div>
              <h2 className="hdash-sec-title">My Donations</h2>
              <p className="hdash-sec-sub">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="hdash-nil">
              <p className="hdash-nil-ic">📋</p>
              <h3>No donations yet</h3>
              <p>Your posted food will appear here after AI screening passes.</p>
            </div>
          ) : (
            <div className="hdash-posts">
              {posts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}