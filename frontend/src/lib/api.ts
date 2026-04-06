import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    googleAuth: (data: any) => api.post('/auth/google', data),
    sendOTP: (email: string) => api.post('/auth/otp/send', { email }),
    verifyOTP: (data: { email: string; otp: string }) => api.post('/auth/otp/verify', data),
    getProfile: () => api.get('/auth/me'),
};

// Doctors
export const doctorAPI = {
    search: (params: any) => api.get('/doctors/search', { params }),
    getById: (id: string) => api.get(`/doctors/${id}`),
    getSlots: (id: string, date: string) => api.get(`/doctors/${id}/slots`, { params: { date } }),
    updateProfile: (data: any) => api.put('/doctors/profile', data),
    updateAvailability: (slots: any) => api.put('/doctors/availability', { slots }),
    getVideoToken: (roomName: string) => api.post('/doctors/video-token', { roomName }),
};

// Patients
export const patientAPI = {
    getProfile: () => api.get('/patients/profile'),
    updateProfile: (data: any) => api.put('/patients/profile', data),
    getHealthTimeline: () => api.get('/patients/health-timeline'),
};

// Appointments
export const appointmentAPI = {
    book: (data: any) => api.post('/appointments/book', data),
    getAll: (status?: string) => api.get('/appointments', { params: { status } }),
    getById: (id: string) => api.get(`/appointments/${id}`),
    updateStatus: (id: string, status: string) => api.put(`/appointments/${id}/status`, { status }),
};

// Prescriptions
export const prescriptionAPI = {
    create: (data: any) => api.post('/prescriptions', data),
    getByAppointment: (id: string) => api.get(`/prescriptions/appointment/${id}`),
    getPatientPrescriptions: () => api.get('/prescriptions/patient'),
};

// Payments
export const paymentAPI = {
    createOrder: (appointmentId: string) => api.post('/payments/create-order', { appointmentId }),
    verify: (data: any) => api.post('/payments/verify', data),
};

// Reports
export const reportAPI = {
    upload: (formData: FormData) => api.post('/reports/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getPatientReports: () => api.get('/reports/patient'),
    getByPatientId: (id: string) => api.get(`/reports/${id}`),
};

// Messages
export const messageAPI = {
    getConversation: (receiverId: string) => api.get(`/messages/${receiverId}`),
    send: (data: any) => api.post('/messages', data),
    markRead: (senderId: string) => api.put(`/messages/read/${senderId}`),
};

// Admin
export const adminAPI = {
    getAnalytics: () => api.get('/admin/analytics'),
    getUsers: (params?: any) => api.get('/admin/users', { params }),
    getDoctors: (params?: any) => api.get('/admin/doctors', { params }),
    approveDoctor: (id: string) => api.put(`/admin/doctors/${id}/approve`),
    rejectDoctor: (id: string) => api.put(`/admin/doctors/${id}/reject`),
    deactivateUser: (id: string) => api.delete(`/admin/users/${id}`),
    getAppointments: (params?: any) => api.get('/admin/appointments', { params }),
};

// AI
export const aiAPI = {
    checkSymptoms: (symptoms: string[]) => api.post('/ai/symptom-check', { symptoms }),
    analyzeReport: (reportText: string) => api.post('/ai/analyze-report', { reportText }),
    generatePrescription: (notes: string) => api.post('/ai/generate-prescription', { notes }),
};

export default api;
