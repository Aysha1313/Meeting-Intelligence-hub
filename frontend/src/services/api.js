import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const meetingAPI = {
  list: () => api.get('/meetings/').then(res => res.data),
  get: (id) => api.get(`/meetings/${id}`).then(res => res.data),
  create: (data) => api.post('/meetings/', data).then(res => res.data),
};

export const transcriptAPI = {
  upload: (meetingId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('meeting_id', meetingId);
    return api.post('/transcripts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  status: (id) => api.get(`/transcripts/${id}/status`).then(res => res.data),
  getActions: (id) => api.get(`/transcripts/${id}/actions`).then(res => res.data),
  getDecisions: (id) => api.get(`/transcripts/${id}/decisions`).then(res => res.data),
  getSentiment: (id) => api.get(`/transcripts/${id}/sentiment`).then(res => res.data),
  
  // Helper to fetch all data for a meeting's transcripts
  getMeetingContent: async (meetingId) => {
    // 1. Get meeting to find transcripts
    const meeting = await meetingAPI.get(meetingId);
    // Since the backend doesn't return full transcript objects in MeetingResponse,
    // we assume the meeting object has transcripts or we fetch them separately if needed.
    // Actually, backend returns transcript_count. We might need a "list transcripts for meeting" endpoint.
    // Looking at backend main.py/transcripts.py, there isn't one yet.
    // I'll add a check or fetch transcripts if the backend provides them in MeetingResponse.
    
    // For now, let's assume we need to list transcripts for a meeting.
    // I'll check if Meeting model relationship is exposed.
    return meeting;
  }
};

export const chatAPI = {
  sendMessage: (question, meetingId) => 
    api.post('/chat/', { question, meeting_id: meetingId }).then(res => res.data),
};

export default api;
