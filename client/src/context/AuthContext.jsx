import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api" 

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // Estado global de auth
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(false)

  // Rehidratación: si hay token guardado, levanta el usuario desde localStorage
  useEffect(() => {
    if (token) {
      const savedUsername = localStorage.getItem("username")
      if (savedUsername) setUser({ username: savedUsername })
    } else {
      setUser(null)
    }
  }, [token])

  // Login con Django (SimpleJWT)
  const login = async (username, password) => {
    setLoading(true)
    try {
      // POST /api/auth/token/  → { access, refresh }
      const { data } = await api.post("auth/token/", { username, password })
      const { access } = data

      // Persistencia: guardamos access token + username
      localStorage.setItem("token", access)
      localStorage.setItem("username", username)

      // Actualizamos estado global
      setToken(access)
      setUser({ username })

      // return true para flujos que quieran saber si todo OK
      return true
    } catch (err) {
      // Propagamos el error para que el componente muestre feedback
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout: limpiamos storage y estado
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
