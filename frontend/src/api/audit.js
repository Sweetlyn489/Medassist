import axiosClient from './axiosClient';

export const listAuditLogs = (params) => axiosClient.get('/audit-logs', { params }).then((r) => r.data);
