import axios from 'axios';

const API = axios.create({ 
  baseURL: 'https://student-management-r9kr.onrender.com/api' 
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data),
};

export const studentAPI = {
  getProfile: () => API.get('/students/profile'),
  updateProfile: (data) => API.put('/students/profile', data),
  uploadPhoto: (data) => API.post('/students/profile/photo', data),
  getDashboard: () => API.get('/students/dashboard'),
  getAchievements: (params) => API.get('/students/achievements', { params }),
  getDocuments: (params) => API.get('/students/documents', { params }),
  addSemesterResult: (data) => API.post('/students/semester-result', data),
};

export const achievementAPI = {
  create: (data) => API.post('/achievements', data),
  getOne: (id) => API.get(`/achievements/${id}`),
  update: (id, data) => API.put(`/achievements/${id}`, data),
  delete: (id) => API.delete(`/achievements/${id}`),
  getStats: () => API.get('/achievements/stats/summary'),
};

export const documentAPI = {
  upload: (data) => API.post('/documents/upload', data),
  getAll: (params) => API.get('/documents', { params }),
  delete: (id) => API.delete(`/documents/${id}`),
};

export const adminAPI = {
  searchStudent: (regNo) => API.get(`/admin/student/${regNo}`),
  getStudents: (params) => API.get('/admin/students', { params }),
  getAnalytics: () => API.get('/admin/analytics'),
  getPendingAchievements: () => API.get('/admin/achievements/pending'),
  verifyAchievement: (id, data) => API.put(`/admin/achievement/${id}/verify`, data),
  verifyDocument: (id) => API.put(`/admin/document/${id}/verify`),
  toggleStudent: (id) => API.put(`/admin/student/${id}/toggle`),
};

export const aiAPI = {
  generateSummary: (achievementId) => API.post('/ai/achievement-summary', { achievementId }),
  analyzeProfile: () => API.post('/ai/profile-analysis'),
  generateResume: () => API.post('/ai/generate-resume-content'),
  getRecommendations: () => API.post('/ai/recommendations'),
  accreditationReport: (data) => API.post('/ai/accreditation-report', data),
};

export default API;
