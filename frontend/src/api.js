import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const meetingAPI = {
  list: () => api.get('/meetings/'),
  create: (data) => api.post('/meetings/', data),
  get: (id) => api.get(`/meetings/${id}`),
};

export const transcriptAPI = {
  upload: (formData) => api.post('/transcripts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStatus: (id) => api.get(`/transcripts/${id}/status`),
  getActions: (id) => api.get(`/transcripts/${id}/actions`),
  getDecisions: (id) => api.get(`/transcripts/${id}/decisions`),
  getSentiment: (id) => api.get(`/transcripts/${id}/sentiment`),
};

export const chatAPI = {
  ask: (question, meetingId = null) => api.post('/chat/', { question, meeting_id: meetingId }),
};

export default api;
