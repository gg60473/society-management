import axios from 'axios';

const BASE = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE });

// ── Towers
export const getTowers = () => api.get('/towers').then(r => r.data);
export const addTower = (data) => api.post('/towers', data).then(r => r.data);
export const deleteTower = (id) => api.delete(`/towers/${id}`).then(r => r.data);

// ── Flats
export const getFlats = (tower_id) => api.get('/flats', { params: tower_id ? { tower_id } : {} }).then(r => r.data);
export const addFlat = (data) => api.post('/flats', data).then(r => r.data);
export const updateFlat = (id, data) => api.patch(`/flats/${id}`, data).then(r => r.data);

// ── Owners
export const getOwners = () => api.get('/owners').then(r => r.data);
export const addOwner = (data) => api.post('/owners', data).then(r => r.data);
export const getOwner = (id) => api.get(`/owners/${id}`).then(r => r.data);

// ── Visitors
export const getVisitors = () => api.get('/visitors').then(r => r.data);
export const addVisitor = (data) => api.post('/visitors', data).then(r => r.data);
export const approveVisitor = (id) => api.patch(`/visitors/${id}/approve`).then(r => r.data);
export const denyVisitor = (id) => api.patch(`/visitors/${id}/deny`).then(r => r.data);
export const checkoutVisitor = (id) => api.patch(`/visitors/${id}/checkout`).then(r => r.data);

// ── Maintenance
export const getMaintenance = () => api.get('/maintenance').then(r => r.data);
export const addMaintenance = (data) => api.post('/maintenance', data).then(r => r.data);
export const updateMaintenance = (id, data) => api.patch(`/maintenance/${id}`, data).then(r => r.data);

// ── Notices
export const getNotices = () => api.get('/notices').then(r => r.data);
export const addNotice = (data) => api.post('/notices', data).then(r => r.data);

// ── Expenses
export const getExpenses = () => api.get('/expenses').then(r => r.data);
export const addExpense = (data) => api.post('/expenses', data).then(r => r.data);

// ── Dashboard & AI
export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data);
export const getAIInsights = () => api.get('/ai/insights').then(r => r.data);
