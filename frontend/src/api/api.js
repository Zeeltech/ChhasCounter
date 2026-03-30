import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Users
export const getUsers = () => api.get('/users').then(r => r.data)
export const createUser = (name) => api.post('/users', { name }).then(r => r.data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// Packs
export const getAllPacks = () => api.get('/packs').then(r => r.data)
export const getActivePacks = () => api.get('/packs/active').then(r => r.data)
export const getHistory = () => api.get('/packs/history').then(r => r.data)
export const getPack = (id) => api.get(`/packs/${id}`).then(r => r.data)
export const createPack = (data) => api.post('/packs', data).then(r => r.data)
export const updatePack = (id, data) => api.put(`/packs/${id}`, data).then(r => r.data)
export const deletePack = (id) => api.delete(`/packs/${id}`)
export const getPackSummary = (id) => api.get(`/packs/${id}/summary`).then(r => r.data)

// Consumption
export const addConsumption = (packId, userId, quantity) =>
  api.post(`/packs/${packId}/consume`, { userId, quantity }).then(r => r.data)
export const getLogs = (packId) => api.get(`/packs/${packId}/logs`).then(r => r.data)
export const undoLastEntry = (packId) => api.delete(`/packs/${packId}/undo`).then(r => r.data)
export const deleteLog = (logId) => api.delete(`/logs/${logId}`)
export const updateLog = (logId, quantity) => api.put(`/logs/${logId}`, { quantity }).then(r => r.data)

export default api
