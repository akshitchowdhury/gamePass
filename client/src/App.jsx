import { useCallback, useEffect, useRef, useState } from 'react'
import Login from './components/Login'
import Store from './components/Store'
import Toasts from './components/Toasts'

const SESSION_KEY = 'gamepass_session'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  // persist session
  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const notify = useCallback((message, tone = 'info') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
    notify('Signed out. See you soon!', 'info')
  }, [notify])

  return (
    <>
      <div className="app-aurora" />
      {user ? (
        <Store user={user} setUser={setUser} onLogout={handleLogout} notify={notify} />
      ) : (
        <Login
          onAuthed={(u) => {
            setUser(u)
            notify(`Welcome, ${u.username}!`, 'success')
          }}
        />
      )}
      <Toasts items={toasts} />
    </>
  )
}
