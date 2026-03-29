import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const paymentApi = {
  payBooking: (bookingId) =>
    httpClient.post(API_PATHS.PAYMENTS_PAY, { booking_id: bookingId }),

  getMyPayments: () => httpClient.get(API_PATHS.PAYMENTS),
};
