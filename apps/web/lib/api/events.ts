import apiClient from '../axios';
import {
    CreateEventDto,
    UpdateEventDto,
    ChangeEventStatusDto,
    EventFilters,
    EventsResponse
} from '@repo/shared';

export const eventsApi = {
  getAllEvents: async (filters?: EventFilters): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/events?${params.toString()}`);
    return response.data;
  },

  getMyEvents: async (filters?: EventFilters): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/events/my-events?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventDto) => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventDto) => {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
  },

  changeStatus: async (id: string, data: ChangeEventStatusDto) => {
    const response = await apiClient.patch(`/events/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};
