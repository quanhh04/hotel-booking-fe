import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const bookingApi = {
  createBooking: (data) => httpClient.post(API_PATHS.BOOKINGS, data),

  getMyBookings: () => httpClient.get(API_PATHS.BOOKINGS),

  getBookingDetail: (id) => httpClient.get(API_PATHS.BOOKING_DETAIL(id)),

  cancelBooking: (id) => httpClient.patch(API_PATHS.BOOKING_CANCEL(id)),
};
