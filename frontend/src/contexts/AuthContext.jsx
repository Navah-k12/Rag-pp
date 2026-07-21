import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const AUTH_API = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5194'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('studyrag-token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchMe(token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('studyrag-token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async (jwt) => {
    const res = await fetch(`${AUTH_API}/api/Auth/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    if (!res.ok) throw new Error('Unauthorized')
    return res.json()
  }

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${AUTH_API}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesion')
    localStorage.setItem('studyrag-token', data.token)
    setToken(data.token)
    setUser({ id: data.id, name: data.name, email: data.email })
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await fetch(`${AUTH_API}/api/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al registrar')
    localStorage.setItem('studyrag-token', data.token)
    setToken(data.token)
    setUser({ id: data.id, name: data.name, email: data.email })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('studyrag-token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
