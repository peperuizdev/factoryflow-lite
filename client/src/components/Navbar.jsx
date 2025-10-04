import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, token, logout } = useAuth()

  return (
    <nav className="bg-slate-800 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-white">FactoryFlow Lite</h1>

        <div className="flex items-center gap-4 text-gray-300">
          <Link to="/" className="hover:text-blue-400 transition">Inicio</Link>

          {/* Mostrar link a zona privada SOLO si hay token */}
          {token && (
            <Link to="/workorders" className="hover:text-blue-400 transition">
              WorkOrders
            </Link>
          )}

          {/* Autenticación: saludo + logout vs acceso a login */}
          {token ? (
            <>
              <span className="text-sm text-gray-400">
                {user?.username ? `Hola, ${user.username}` : "Conectado"}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-400 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
