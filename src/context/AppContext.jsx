import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const Ctx = createContext()
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const load = (key, def) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? def }
  catch { return def }
}

export function AppProvider({ children, showToast }) {
  const [posts,  setPosts]  = useState(() => load('fr_posts',  []))
  const [notifs, setNotifs] = useState(() => load('fr_notifs', []))

  useEffect(() => { localStorage.setItem('fr_posts',  JSON.stringify(posts))  }, [posts])
  useEffect(() => { localStorage.setItem('fr_notifs', JSON.stringify(notifs)) }, [notifs])

  const addPost = useCallback((data) => {
    const post = { ...data, id: uid(), created_at: new Date().toISOString(), status: 'available' }
    setPosts(prev => [post, ...prev])
    return post
  }, [])

  const respond = useCallback((postId, action, ngoInfo) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      if (action === 'accept') {
        const notif = {
          id: uid(),
          food_name: p.food_name,
          ngo_name: ngoInfo.name,
          message: `🤝 "${p.food_name}" accepted by ${ngoInfo.name}!`,
          read: false,
          at: new Date().toISOString(),
        }
        setNotifs(n => [notif, ...n])
        showToast({ msg: `✅ ${ngoInfo.name} accepted "${p.food_name}"`, type: 'success' })
        return { ...p, status: 'accepted', ngo_name: ngoInfo.name, ngo_phone: ngoInfo.phone, accepted_at: new Date().toISOString() }
      }
      const declineNotif = {
        id: uid(), food_name: p.food_name, type: 'decline',
        message: `❌ "${p.food_name}" was declined by the NGO`,
        read: false, at: new Date().toISOString(),
      }
      setNotifs(n => [declineNotif, ...n])
      showToast({ msg: `❌ NGO declined "${p.food_name}"`, type: 'error' })
      return { ...p, status: 'declined', declined_at: new Date().toISOString() }
    }))
  }, [showToast])

  const markPickedUp = useCallback((postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      setNotifs(n => [{
        id: uid(), food_name: p.food_name, type: 'pickup',
        message: `🎉 "${p.food_name}" has been picked up by ${p.ngo_name}!`,
        read: false, at: new Date().toISOString(),
      }, ...n])
      showToast({ msg: `🎉 "${p.food_name}" picked up! Hotel notified.`, type: 'success' })
      return { ...p, status: 'picked_up', picked_up_at: new Date().toISOString() }
    }))
  }, [showToast])

  const cancelPickup = useCallback((postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      showToast({ msg: `↩️ Pickup cancelled for "${p.food_name}"`, type: 'error' })
      return { ...p, status: 'available', ngo_name: null, ngo_phone: null, accepted_at: null }
    }))
  }, [showToast])

  const markRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const unread         = notifs.filter(n => !n.read).length
  const available      = posts.filter(p => p.status === 'available')
  const activePosts    = posts.filter(p => p.status === 'accepted')
  const completedPosts = posts.filter(p => p.status === 'picked_up')


  return (
    <Ctx.Provider value={{ posts, notifs, unread, available, activePosts, completedPosts, addPost, respond, markRead, markPickedUp, cancelPickup }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)