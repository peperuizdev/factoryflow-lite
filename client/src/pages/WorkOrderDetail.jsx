import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getWorkOrder, updateWorkOrder } from "../services/workorders"
import { listInspections, createInspection } from "../services/inspections"

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

// Opciones de estado que el backend acepta (choices del modelo)
const STATUS_OPTIONS = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
]

export default function WorkOrderDetail() {
  // :id de la URL → /workorders/:id
  const { id } = useParams()

  // Estado de la orden + inspecciones
  const [order, setOrder] = useState(null)
  const [inspections, setInspections] = useState([])

  // Cargas/errores de datos
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [loadingIns, setLoadingIns] = useState(false)
  const [error, setError] = useState(null)

  // Formulario de nueva inspección
  const [result, setResult] = useState("OK")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  // Formulario de edición de WorkOrder (inputs controlados)
  const [editTitle, setEditTitle] = useState("")
  const [editStation, setEditStation] = useState("")
  const [editStatus, setEditStatus] = useState("OPEN")
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editSuccess, setEditSuccess] = useState(null)

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

  // Cuando llega la orden, precargar los campos del formulario de edición
  useEffect(() => {
    if (!order) return
    setEditTitle(order.title ?? "")
    setEditStation(order.station ?? "")
    setEditStatus(order.status ?? "OPEN")
  }, [order])

  // Cargar inspecciones de la orden
  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchInspections() {
      setLoadingIns(true)
      try {
        const resp = await listInspections({ work_order: id })
        const items = Array.isArray(resp) ? resp : resp?.results ?? []
        if (!cancelled) setInspections(items)
      } catch {
        // manejar error de inspecciones aparte
      } finally {
        if (!cancelled) setLoadingIns(false)
      }
    }
    fetchInspections()
    return () => { cancelled = true }
  }, [id])

  // Crear inspección
  const handleCreateInspection = async (e) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      const created = await createInspection({
        work_order: Number(id),
        result,
        notes: notes.trim() || undefined,
      })
      setInspections((prev) => [created, ...prev])
      setNotes("")
      setResult("OK")
      setFormSuccess("Inspección creada correctamente.")
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 400 ? "Datos inválidos. Revisa el formulario."
        : status === 401 ? "No autorizado. Inicia sesión."
        : "No se pudo crear la inspección."
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Guardar cambios de la WorkOrder (PATCH)
  const handleUpdateWorkOrder = async (e) => {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(null)
    setSavingEdit(true)
    try {
      // Componemos payload parcial (PATCH)
      const payload = {
        title: editTitle.trim(),
        station: editStation.trim(),
        status: editStatus,
      }

      const updated = await updateWorkOrder(Number(id), payload) // PATCH /api/workorders/:id/
      // Actualizamos la orden en memoria para que la UI refleje los cambios
      setOrder(updated)
      setEditSuccess("Orden actualizada correctamente.")
    } catch (err) {
      const status = err?.response?.status
      const msg =
        status === 400 ? "Datos inválidos. Revisa los campos."
        : status === 401 ? "No autorizado. Inicia sesión."
        : "No se pudo actualizar la orden."
      setEditError(msg)
    } finally {
      setSavingEdit(false)
    }
  }

  // Si falla cargar la orden, no seguimos
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
      {/* Volver*/}
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

      {/*Formulario de edición de WorkOrder */}
      <div className="rounded-xl border border-slate-700 p-6 bg-slate-800/40">
        <h3 className="text-xl font-semibold mb-4">Editar orden</h3>

        {editError && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
            {editError}
          </div>
        )}
        {editSuccess && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded">
            {editSuccess}
          </div>
        )}

        <form onSubmit={handleUpdateWorkOrder} className="grid gap-4 md:grid-cols-3">
          {/* Título */}
          <div className="md:col-span-1">
            <label htmlFor="editTitle" className="block text-sm text-gray-300 mb-1">Título</label>
            <input
              id="editTitle"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={savingEdit || loadingOrder || !order}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Estación */}
          <div className="md:col-span-1">
            <label htmlFor="editStation" className="block text-sm text-gray-300 mb-1">Estación</label>
            <input
              id="editStation"
              type="text"
              value={editStation}
              onChange={(e) => setEditStation(e.target.value)}
              disabled={savingEdit || loadingOrder || !order}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Estado */}
          <div className="md:col-span-1">
            <label htmlFor="editStatus" className="block text-sm text-gray-300 mb-1">Estado</label>
            <select
              id="editStatus"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              disabled={savingEdit || loadingOrder || !order}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
              required
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Guardar */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={savingEdit || loadingOrder || !order}
              className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition"
            >
              {savingEdit ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
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
