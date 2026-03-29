import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const notificationApi = {
  getNotifications: (page, limit) =>
    httpClient.get(API_PATHS.NOTIFICATIONS, { page, limit }),

  markAsRead: (id) => httpClient.patch(API_PATHS.NOTIFICATION_READ(id)),

  markAllAsRead: () => httpClient.patch(API_PATHS.NOTIFICATIONS_READ_ALL),
};
