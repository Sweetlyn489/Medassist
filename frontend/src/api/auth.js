import axiosClient from './axiosClient';

export const login = (email, password) => axiosClient.post('/auth/login', { email, password }).then((r) => r.data.data);
export const me = () => axiosClient.get('/auth/me').then((r) => r.data.data);
export const registerUser = (payload) => axiosClient.post('/auth/register', payload).then((r) => r.data.data);
export const listClinicians = () => axiosClient.get('/auth/clinicians').then((r) => r.data.data);
export const listUsers = () => axiosClient.get('/auth/users').then((r) => r.data.data);
export const updateUserStatus = (userId, active) => axiosClient.put(`/auth/users/${userId}/status`, { active }).then((r) => r.data.data);
