import api from "./api"

// Lista órdenes de trabajo con paginación y filtro opcional por estado
export async function listWorkOrders({ status, page = 1 } = {}) {
  // Construimos el objeto de query params para la URL (?status=...&page=...)
  const params = {}
  if (status) params.status = status
  if (page) params.page = page
  // Hacemos la petición GET a /workorders/ con los query params
  const response = await api.get("workorders/", { params })
  // Devolvemos los datos (lista de órdenes y metadatos de paginación)
  return response.data
}

// Obtiene una orden por su ID.
export async function getWorkOrder(id) {
  const response = await api.get(`workorders/${id}/`)
  return response.data
}

// Crea una nueva orden (POST).
export async function createWorkOrder(payload) {
  const response = await api.post("workorders/", payload)
  return response.data
}

// Actualiza una orden (PATCH).
export async function updateWorkOrder(id, payload) {
  const response = await api.patch(`workorders/${id}/`, payload)
  return response.data
}

// Elimina una orden (DELETE).
export async function deleteWorkOrder(id) {
  await api.delete(`workorders/${id}/`)
  return true
}
