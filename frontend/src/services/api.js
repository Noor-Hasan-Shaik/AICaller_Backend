import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://aicaller-backend.aispirelabs.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const login = (formData) => api.post('/auth/login', formData);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Health check
export const health = () => api.get('/health/');

// Statistics
export const getStats = (days = 30) => api.get(`/stats/dashboard?days=${days}`);

// Leads
export const getLeads = (params = {}) => api.get('/leads/', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads/', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const startCall = (id) => api.post(`/calls/`, { lead_id: id });

// Calls
export const getCalls = (params = {}) => api.get('/calls/', { params });
export const getCall = (id) => api.get(`/calls/${id}`);
export const startCallWithPurpose = (data) => api.post('/calls/', data);

// Groups
export const getGroups = (params = {}) => api.get('/groups/', { params });
export const getGroup = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups/', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const addLeadToGroup = (groupId, leadId) => api.post(`/groups/${groupId}/leads/${leadId}`);
export const removeLeadFromGroup = (groupId, leadId) => api.delete(`/groups/${groupId}/leads/${leadId}`);
export const getGroupLeads = (groupId) => api.get(`/groups/${groupId}/leads`);

// Group Calls
export const getGroupCalls = (params = {}) => api.get('/group-calls/', { params });
export const getGroupCall = (id) => api.get(`/group-calls/${id}`);
export const createGroupCall = (data) => api.post('/group-calls/', data);
export const updateGroupCall = (id, data) => api.put(`/group-calls/${id}`, data);
export const startGroupCall = (id) => api.post(`/group-calls/${id}/start`);
export const pauseGroupCall = (id) => api.post(`/group-calls/${id}/pause`);
export const resumeGroupCall = (id) => api.post(`/group-calls/${id}/resume`);
export const nextGroupCall = (id) => api.post(`/group-calls/${id}/next`);
export const getGroupCallQueueStatus = (id) => api.get(`/group-calls/${id}/queue-status`);

// Scheduler
export const startScheduler = () => api.post('/scheduler/start');
export const stopScheduler = () => api.post('/scheduler/stop');
export const getSchedulerStatus = () => api.get('/stats/queue');

// File upload
export const uploadLeads = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/leads/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Export
export const exportLeads = () => api.get('/export/leads', { responseType: 'blob' });
export const exportCalls = () => api.get('/export/calls', { responseType: 'blob' });

// AI endpoints
export const startConversation = (data) => api.post('/ai/conversation', data);
export const analyzeConversation = (conversation) => api.post('/ai/analyze-conversation', conversation);
export const generateFollowUp = (leadId, summary) => api.post('/ai/generate-follow-up', { lead_id: leadId, conversation_summary: summary });

// Export apiService for backward compatibility
export const apiService = {
  // Authentication
  login,
  register,
  getCurrentUser,
  logout,
  
  // Health check
  health,
  
  // Statistics
  getStats,
  
  // Leads
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  startCall,
  
  // Calls
  getCalls,
  getCall,
  startCallWithPurpose,
  
  // Groups
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addLeadToGroup,
  removeLeadFromGroup,
  getGroupLeads,
  
  // Group Calls
  getGroupCalls,
  getGroupCall,
  createGroupCall,
  updateGroupCall,
  startGroupCall,
  pauseGroupCall,
  resumeGroupCall,
  nextGroupCall,
  getGroupCallQueueStatus,
  
  // Scheduler
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  
  // File upload
  uploadLeads,
  
  // Export
  exportLeads,
  exportCalls,
  
  // AI
  startConversation,
  analyzeConversation,
  generateFollowUp,
};

// Export the api instance for direct use if needed
export default api; 