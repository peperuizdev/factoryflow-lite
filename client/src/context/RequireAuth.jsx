import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
- Si hay token → renderiza las rutas hijas (Outlet).
- Si NO hay token → redirige a /login guardando la ruta de origen en `state.from`.
 **/
export default function RequireAuth() {
  const { token } = useAuth()          // ← leemos el estado global de auth
  const location = useLocation()       // ← sabemos dónde estábamos

  if (!token) {
    // No autenticado: navegamos a /login y recordamos "desde dónde" para volver luego
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  // Autenticado: renderizamos la ruta hija protegida
  return <Outlet />
}
