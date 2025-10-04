import api from "./api"

// Lista inspecciones de trabajo con paginación y filtro opcional por estado
export async function listInspections({ work_order, page = 1 } = {}) {
  // Construimos el objeto de query params para la URL (?status=...&page=...)
  const params = {}
  if (work_order) params.work_order = work_order
  if (page) params.page = page
  // Hacemos la petición GET a /inspections/ con los query params
  const response = await api.get("inspections/", { params })
  // Devolvemos los datos (lista de inspecciones y metadatos de paginación)
  return response.data
}

// Obtiene una inspección por su ID.
export async function getInspection(id) {
  const response = await api.get(`inspections/${id}/`)
  return response.data
}

// Crea una nueva inspección (POST).
export async function createInspection(payload) {
  const response = await api.post("inspections/", payload)
  return response.data
}

// Actualiza una inspección (PATCH).
export async function updateInspection(id, payload) {
  const response = await api.patch(`inspections/${id}/`, payload)
  return response.data
}

// Eliminar una inspección (DELETE).
export async function deleteInspection(id) {
  await api.delete(`inspections/${id}/`)
  return true
}
