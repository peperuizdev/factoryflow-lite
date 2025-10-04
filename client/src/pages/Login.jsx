import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  // Obtenemos acciones/estado global de autenticación desde el Context
  const { login, loading } = useAuth()

  // Estado local controlado del formulario
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  // Herramientas de routing para redirigir tras login
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  // Manejador de envío del formulario: llama al backend (JWT) y redirige
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await login(username, password)        // ← hace POST /api/auth/token/
      navigate(from, { replace: true })      // ← vuelve a la ruta origen o Home
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 400 || status === 401
          ? "Credenciales incorrectas."
          : "No se pudo iniciar sesión. Inténtalo de nuevo."
      setError(msg)
    }
  }

  // UI del formulario (inputs controlados + feedback de error/carga)
  return (
    <section className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Iniciar sesión</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-xl shadow">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm text-gray-300">Usuario</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm text-gray-300">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 font-semibold transition"
        >
          {loading ? "Accediendo..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
            Volver al inicio
          </Link>
        </p>
      </form>
    </section>
  )
}
