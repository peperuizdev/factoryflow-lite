import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loading, setLoading] = useState(false)

  // Simulación: si hay token en localStorage, consideramos que el usuario está autenticado
  useEffect(() => {
    if (token) {
      setUser({ username: "usuario_demo" }) // Se integrará con datos reales del backend
    }
  }, [token])

  // Login simulado preparado para integrar con backend real
  const login = async (username, password) => {
    setLoading(true)
    try {
      // Aquí se hará la llamada real al backend
      const fakeToken = "FAKE_TOKEN_EXAMPLE"
      localStorage.setItem("token", fakeToken)
      setToken(fakeToken)
      setUser({ username })
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("token")
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
