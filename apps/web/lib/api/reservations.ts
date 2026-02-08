import apiClient from '../axios';
import { CreateReservationData, ChangeReservationStatusData } from '@repo/shared';

export const reservationsApi = {
  getAll: async () => {
    const response = await apiClient.get('/reservations');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/reservations/stats/all');
    return response.data;
  },

  getMyReservations: async () => {
    const response = await apiClient.get('/reservations/my-reservations');
    return response.data;
  },

  getByEvent: async (eventId: string) => {
    const response = await apiClient.get(`/reservations/event/${eventId}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: CreateReservationData) => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  changeStatus: async (id: string, data: ChangeReservationStatusData) => {
    const response = await apiClient.patch(`/reservations/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  },

  downloadTicket: async (id: string) => {
    const response = await apiClient.get(`/reservations/${id}/ticket`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
