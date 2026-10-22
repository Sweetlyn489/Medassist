import axiosClient from './axiosClient';

export const getDashboard = () => axiosClient.get('/dashboard').then((r) => r.data.data);
