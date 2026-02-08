import apiClient from '../axios';

export const usersApi = {
  // Expecting a server route GET /api/users/me that returns current user
  getCurrent: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  // PATCH /api/users/me { fullName, email }
  updateProfile: async (payload: { fullName?: string; email?: string }) => {
    const res = await apiClient.patch('/users/me', payload);
    return res.data;
  },

  // Change password endpoint POST /api/users/me/password { currentPassword, newPassword }
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.post('/users/me/password', payload);
    return res.data;
  },
};
