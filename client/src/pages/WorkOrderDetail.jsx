import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getWorkOrder } from "../services/workorders"
import { listInspections, createInspection } from "../services/inspections"  // ← NUEVO: createInspection

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

  // Estado de la orden + inspecciones
  const [order, setOrder] = useState(null)
  const [inspections, setInspections] = useState([])

  // Cargas/errores de datos
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [loadingIns, setLoadingIns] = useState(false)
  const [error, setError] = useState(null)

  // Estado del formulario de nueva inspección (inputs controlados)
  const [result, setResult] = useState("OK")    // "OK" | "FAIL"
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  // Cargar la WorkOrder
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

  // Cargar inspecciones de la orden (filtrado en backend)
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
        // si falla, mantenemos la UI viva; podemos setear un error
      } finally {
        if (!cancelled) setLoadingIns(false)
      }
    }
    fetchInspections()
    return () => { cancelled = true }
  }, [id])

  // 7) Submit del formulario: crear inspección y refrescar lista en memoria
  const handleCreateInspection = async (e) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      // POST /api/inspections/ con payload 
      const created = await createInspection({
        work_order: Number(id),
        result,
        notes: notes.trim() || undefined,
      })

      // Actualización in-memory: añadimos la nueva inspección al principio
      setInspections((prev) => [created, ...prev])

      // Limpiar formulario y feedback
      setNotes("")
      setResult("OK")
      setFormSuccess("Inspección creada correctamente.")
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 400
          ? "Datos inválidos. Revisa el formulario."
          : status === 401
            ? "No autorizado. Inicia sesión."
            : "No se pudo crear la inspección."
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // 8) Si falla cargar la orden, no tiene sentido seguir
  if (error) {
    return (
      <section className="space-y-4">
        <Link to="/workorders" className="text-blue-400 hover:text-blue-300 underline">← Volver</Link>
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">{error}</div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Volver */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/workorders" className="text-blue-400 hover:text-blue-300 underline">← Volver a órdenes</Link>
      </div>

      {/* Encabezado */}
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

      {/* Formulario de nueva inspección */}
      <div className="rounded-xl border border-slate-700 p-6 bg-slate-800/40">
        <h3 className="text-xl font-semibold mb-4">Nueva inspección</h3>

        {formError && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleCreateInspection} className="grid gap-4 md:grid-cols-3">
          {/* Resultado */}
          <div className="md:col-span-1">
            <label htmlFor="result" className="block text-sm text-gray-300 mb-1">Resultado</label>
            <select
              id="result"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="OK">OK</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          {/* Notas */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm text-gray-300 mb-1">Notas (opcional)</label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de la inspección"
              disabled={submitting}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition"
            >
              {submitting ? "Creando…" : "Crear inspección"}
            </button>
          </div>
        </form>
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
