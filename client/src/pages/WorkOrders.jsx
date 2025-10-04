import { useEffect, useState } from "react"
import { listWorkOrders, createWorkOrder, deleteWorkOrder } from "../services/workorders"
import { Link } from "react-router-dom"

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
  // Estado de filtro/paginación/datos/carga/error
  const [status, setStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], count: null, next: null, previous: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estado del formulario de creación
  const [newTitle, setNewTitle] = useState("")
  const [newStation, setNewStation] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

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
    return () => { cancelled = true }
  }, [status, page])

  // Crear una orden
  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError(null)
    if (!newTitle.trim() || !newStation.trim()) {
      setCreateError("Título y Estación son obligatorios.")
      return
    }
    setCreating(true)
    try {
      const created = await createWorkOrder({
        title: newTitle.trim(),
        station: newStation.trim(),
        status: "OPEN",
      })
      // Insertamos la nueva orden al principio
      setData((prev) => {
        const items = [created, ...prev.items]
        const count = typeof prev.count === "number" ? prev.count + 1 : prev.count
        return { ...prev, items, count }
      })
      setNewTitle("")
      setNewStation("")
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 400 ? "Datos inválidos. Revisa los campos." :
        status === 401 ? "No autorizado. Inicia sesión." :
        "No se pudo crear la orden."
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  // Eliminar una orden con confirmación
  const handleDelete = async (id) => {
    const ok = window.confirm("¿Seguro que quieres eliminar esta orden?")
    if (!ok) return
    try {
      await deleteWorkOrder(id)
      setData((prev) => {
        const items = prev.items.filter((it) => it.id !== id)
        const count = typeof prev.count === "number" ? Math.max(prev.count - 1, 0) : prev.count
        return { ...prev, items, count }
      })
      // Si nos quedamos sin items y hay página anterior, retrocedemos una
      setTimeout(() => {
        setData((prev) => {
          if (prev.items.length === 0 && prev.previous) {
            setPage((p) => Math.max(1, p - 1))
          }
          return prev
        })
      }, 0)
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 401 ? "No autorizado. Inicia sesión." :
        "No se pudo eliminar la orden."
      alert(msg)
    }
  }

  const onChangeStatus = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const canPrev = Boolean(data.previous)
  const canNext = Boolean(data.next)

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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

      {/* NUEVO: Formulario inline para crear una nueva orden (simple y accesible) */}
      <div className="rounded-xl border border-slate-700 p-4 bg-slate-800/40">
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="newTitle" className="block text-sm text-gray-300 mb-1">Título</label>
            <input
              id="newTitle"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={creating}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              placeholder="Ej. Inspección ala izq."
              required
            />
          </div>
          <div>
            <label htmlFor="newStation" className="block text-sm text-gray-300 mb-1">Estación</label>
            <input
              id="newStation"
              type="text"
              value={newStation}
              onChange={(e) => setNewStation(e.target.value)}
              disabled={creating}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              placeholder="Ej. ST-12"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full md:w-auto px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition"
            >
              {creating ? "Creando…" : "Crear orden"}
            </button>
          </div>
        </form>
        {createError && (
          <div className="mt-3 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
            {createError}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          * El estado inicial se establece a <span className="font-semibold">OPEN</span>.
        </p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No hay órdenes para mostrar.
                  </td>
                </tr>
              )}
              {data.items.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-sm text-gray-300">{wo.id}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/workorders/${wo.id}`} className="text-blue-400 hover:text-blue-300 underline">
                      {wo.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{wo.station}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={wo.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {wo.created_at ? new Date(wo.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDelete(wo.id)}
                      className="px-3 py-1 rounded border border-red-600 text-red-300 hover:bg-red-600/10 transition"
                      title="Eliminar orden"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
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
