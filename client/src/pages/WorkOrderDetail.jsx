import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getWorkOrder } from "../services/workorders"
import { listInspections } from "../services/inspections"

function StatusBadge({ status }) {
  const base = "px-2 py-1 rounded text-xs font-semibold"
  const palette = {
    OPEN: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    IN_PROGRESS: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    DONE: "bg-green-500/20 text-green-300 border border-green-500/40",
  }
  return <span className={`${base} ${palette[status] || "bg-slate-700 text-slate-300"}`}>{status}</span>
}

function ResultBadge({ result }) {
  const base = "px-2 py-1 rounded text-xs font-semibold"
  const palette = {
    OK: "bg-green-500/20 text-green-300 border border-green-500/40",
    FAIL: "bg-red-500/20 text-red-300 border border-red-500/40",
  }
  return <span className={`${base} ${palette[result] || "bg-slate-700 text-slate-300"}`}>{result}</span>
}

export default function WorkOrderDetail() {
  // Leemos el :id de la URL → /workorders/:id
  const { id } = useParams()

  // Estado local para la orden, inspecciones y estados de carga/error
  const [order, setOrder] = useState(null)
  const [inspections, setInspections] = useState([])
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [loadingIns, setLoadingIns] = useState(false)
  const [error, setError] = useState(null)

  // Efecto: cargar la WorkOrder cuando cambia el id
  useEffect(() => {
    let cancelled = false
    async function fetchOrder() {
      setLoadingOrder(true)
      setError(null)
      try {
        const data = await getWorkOrder(id) // GET /api/workorders/:id/
        if (!cancelled) setOrder(data)
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status
          const msg = status === 404
            ? "Orden no encontrada."
            : status === 401
              ? "No autorizado. Inicia sesión."
              : "No se pudo cargar la orden."
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoadingOrder(false)
      }
    }
    fetchOrder()
    return () => { cancelled = true }
  }, [id])

  // Efecto: cargar inspecciones asociadas a la orden (filtrado en backend)
  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchInspections() {
      setLoadingIns(true)
      try {
        const resp = await listInspections({ work_order: id })
        const items = Array.isArray(resp) ? resp : resp?.results ?? []
        if (!cancelled) setInspections(items)
      } catch (err) {
        // Si falla, no interrumpimos toda la vista; mostramos vacío o podrías setear un error específico
      } finally {
        if (!cancelled) setLoadingIns(false)
      }
    }
    fetchInspections()
    return () => { cancelled = true }
  }, [id])

  // Render de estados de error/carga global (si falla la orden, no tiene sentido seguir)
  if (error) {
    return (
      <section className="space-y-4">
        <Link to="/workorders" className="text-blue-400 hover:text-blue-300 underline">← Volver</Link>
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">{error}</div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Volver a órdenes */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/workorders" className="text-blue-400 hover:text-blue-300 underline">← Volver a órdenes</Link>
      </div>

      {/* Encabezado con info principal */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">
            {loadingOrder ? "Cargando..." : order?.title ?? "—"}
          </h2>
          {!loadingOrder && order?.status && <StatusBadge status={order.status} />}
        </div>
        {!loadingOrder && order && (
          <div className="text-gray-300 text-sm space-x-4">
            <span><span className="text-gray-400">ID:</span> {order.id}</span>
            <span><span className="text-gray-400">Estación:</span> {order.station}</span>
            <span>
              <span className="text-gray-400">Creado:</span>{" "}
              {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}
            </span>
          </div>
        )}
      </div>

      {/* Lista de inspecciones */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Inspecciones</h3>

        {loadingIns && <div className="text-blue-300">Cargando inspecciones…</div>}

        {!loadingIns && inspections.length === 0 && (
          <div className="text-gray-400">No hay inspecciones para esta orden.</div>
        )}

        {!loadingIns && inspections.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Resultado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Notas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-sm text-gray-300">{ins.id}</td>
                    <td className="px-4 py-3"><ResultBadge result={ins.result} /></td>
                    <td className="px-4 py-3 text-sm text-gray-100">{ins.notes || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {ins.created_at ? new Date(ins.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
