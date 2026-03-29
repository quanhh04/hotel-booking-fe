import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const authApi = {
  register: (email, password) =>
    httpClient.post(API_PATHS.AUTH_REGISTER, { email, password }),

  login: (email, password) =>
    httpClient.post(API_PATHS.AUTH_LOGIN, { email, password }),

  getMe: () => httpClient.get(API_PATHS.AUTH_ME),

  updateProfile: (data) => httpClient.put(API_PATHS.AUTH_PROFILE, data),

  changePassword: (oldPassword, newPassword) =>
    httpClient.put(API_PATHS.AUTH_CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};
