import axiosClient from './axiosClient';

export const listFindings = (params) => axiosClient.get('/findings', { params }).then((r) => r.data);
export const reviewFinding = (id, payload) => axiosClient.put(`/findings/${id}/review`, payload).then((r) => r.data.data);
