import axiosClient from './axiosClient';

export const listFollowUps = (params) => axiosClient.get('/followups', { params }).then((r) => r.data.data);
export const createFollowUp = (payload) => axiosClient.post('/followups', payload).then((r) => r.data.data);
export const updateFollowUp = (id, payload) => axiosClient.put(`/followups/${id}`, payload).then((r) => r.data.data);
