import axiosClient from './axiosClient';

export const listPatients = (params) => axiosClient.get('/patients', { params }).then((r) => r.data);
export const getPatient = (id) => axiosClient.get(`/patients/${id}`).then((r) => r.data.data);
export const createPatient = (payload) => axiosClient.post('/patients', payload).then((r) => r.data.data);
export const updatePatient = (id, payload) => axiosClient.put(`/patients/${id}`, payload).then((r) => r.data.data);

export const listAssessments = (patientId) => axiosClient.get(`/patients/${patientId}/assessments`).then((r) => r.data.data);
export const createAssessment = (patientId, payload) => axiosClient.post(`/patients/${patientId}/assessments`, payload).then((r) => r.data.data);

export const listLabs = (patientId) => axiosClient.get(`/patients/${patientId}/labs`).then((r) => r.data.data);
export const createLab = (patientId, payload) => axiosClient.post(`/patients/${patientId}/labs`, payload).then((r) => r.data.data);

export const listMedications = (patientId) => axiosClient.get(`/patients/${patientId}/medications`).then((r) => r.data.data);
export const createMedication = (patientId, payload) => axiosClient.post(`/patients/${patientId}/medications`, payload).then((r) => r.data.data);
export const updateMedication = (patientId, id, payload) => axiosClient.put(`/patients/${patientId}/medications/${id}`, payload).then((r) => r.data.data);

export const listPatientFindings = (patientId) => axiosClient.get(`/patients/${patientId}/findings`).then((r) => r.data.data);
export const listPatientFollowUps = (patientId) => axiosClient.get(`/patients/${patientId}/followups`).then((r) => r.data.data);
export const getPatientTimeline = (patientId) => axiosClient.get(`/patients/${patientId}/timeline`).then((r) => r.data.data);
export const listPatientImages = (patientId) => axiosClient.get(`/patients/${patientId}/images`).then((r) => r.data.data);
export const listPatientDocuments = (patientId) => axiosClient.get(`/patients/${patientId}/documents`).then((r) => r.data.data);
