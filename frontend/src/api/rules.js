import axiosClient from './axiosClient';

export const listRules = () => axiosClient.get('/rules').then((r) => r.data.data);
export const updateRule = (id, payload) => axiosClient.put(`/rules/${id}`, payload).then((r) => r.data.data);
