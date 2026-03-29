export const API_PATHS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_PROFILE: '/api/auth/profile',
  AUTH_CHANGE_PASSWORD: '/api/auth/change-password',

  // Hotels
  HOTELS: '/api/hotels',
  HOTEL_DETAIL: (id) => `/api/hotels/${id}`,
  HOTEL_ROOMS: (id) => `/api/hotels/${id}/rooms`,

  // Cities
  CITIES: '/api/cities',
  BOOKINGS: '/api/bookings',
  BOOKING_DETAIL: (id) => `/api/bookings/${id}`,
  BOOKING_CANCEL: (id) => `/api/bookings/${id}/cancel`,

  // Reviews
  REVIEWS: '/api/reviews',
  REVIEWS_HOTEL: (hotelId) => `/api/reviews/hotel/${hotelId}`,
  REVIEW_DETAIL: (id) => `/api/reviews/${id}`,
  REVIEWS_ME: '/api/reviews/me',

  // Payments
  PAYMENTS_PAY: '/api/payments/pay',
  PAYMENTS: '/api/payments',

  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
};

export const BOOKING_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã huỷ',
  REFUNDED: 'Đã hoàn tiền',
};
