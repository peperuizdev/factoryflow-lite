import { useEffect, useState } from "react"
import { listWorkOrders } from "../services/workorders"

const STATUS_OPTIONS = [
  { label: "Todas", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
]

function StatusBadge({ status }) {
  const base = "px-2 py-1 rounded text-xs font-semibold"
  const palette = {
    OPEN: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    DONE: "bg-green-500/20 text-green-300 border border-green-500/40",
  }
  return <span className={`${base} ${palette[status] || "bg-slate-700 text-slate-300"}`}>{status}</span>
}

export default function WorkOrders() {
  // Estado de UI: filtro, paginación, datos, carga y error
  const [status, setStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], count: null, next: null, previous: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Efecto: cada vez que cambia el filtro o la página, pedimos datos al backend
  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const resp = await listWorkOrders({
          status: status === "ALL" ? undefined : status,
          page,
        })

        // Normalización del shape: DRF paginado vs no paginado
        const items = Array.isArray(resp) ? resp : resp?.results ?? []
        const count = Array.isArray(resp) ? resp.length : resp?.count ?? null
        const next = Array.isArray(resp) ? null : resp?.next ?? null
        const previous = Array.isArray(resp) ? null : resp?.previous ?? null

        if (!cancelled) setData({ items, count, next, previous })
      } catch (err) {
        if (!cancelled) {
          const is401 = err?.response?.status === 401
          setError(is401 ? "No autorizado. Inicia sesión." : "No se pudieron cargar las órdenes.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      // Evita setState si el componente se desmonta antes de terminar la petición
      cancelled = true
    }
  }, [status, page])

  // Handlers de UI
  const onChangeStatus = (e) => {
    setStatus(e.target.value)
    setPage(1) // al cambiar filtro, reseteamos a página 1
  }

  const canPrev = Boolean(data.previous)
  const canNext = Boolean(data.next)

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Órdenes de trabajo</h2>
          <p className="text-gray-400">Lista filtrable por estado y con paginación.</p>
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm text-gray-300">Estado</label>
          <select
            id="status"
            value={status}
            onChange={onChangeStatus}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados de carga / error */}
      {loading && (
        <div className="text-blue-300">Cargando órdenes...</div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Tabla de resultados */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Título</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Estación</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No hay órdenes para mostrar.
                  </td>
                </tr>
              )}
              {data.items.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-sm text-gray-300">{wo.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{wo.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{wo.station}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={wo.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {wo.created_at ? new Date(wo.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación (solo si el backend devuelve next/previous) */}
      {!loading && !error && (data.next || data.previous) && (
        <div className="flex items-center justify-between">
          <button
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded border border-slate-700 text-sm disabled:opacity-50"
          >
            ← Anterior
          </button>
          <div className="text-sm text-gray-400">
            {typeof data.count === "number" ? `Total: ${data.count}` : null}
          </div>
          <button
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
            className="px-3 py-2 rounded border border-slate-700 text-sm disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </section>
  )
}
