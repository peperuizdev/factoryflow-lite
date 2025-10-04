import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-xl border border-slate-700 p-4 bg-slate-800/40">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  )
}

export default function Home() {
  const { token, user } = useAuth()

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center gap-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">FactoryFlow Lite</h1>
        <p className="text-gray-300">
          Demo Full-Stack: Django REST + React + JWT. Gestión simple de órdenes e inspecciones.
        </p>
        <div className="flex justify-center gap-3">
          {token ? (
            <Link
              to="/workorders"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
            >
              Ir a Órdenes
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {token
            ? `Conectado como ${user?.username || "usuario"}.`
            : "Accede con tu usuario para crear/editar órdenes e inspecciones."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto text-left">
        <FeatureCard title="Órdenes" desc="Crea, filtra, pagina, edita y elimina." />
        <FeatureCard title="Inspecciones" desc="Añade resultados OK/FAIL por orden." />
        <FeatureCard title="Seguridad" desc="Auth JWT, rutas privadas y servicios Axios." />
      </div>
    </section>
  )
}
