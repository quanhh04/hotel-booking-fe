const P = import.meta.env.VITE_API_PREFIX ?? '/api';

export const API_PATHS = {
  // Auth
  AUTH_REGISTER: `${P}/auth/register`,
  AUTH_LOGIN: `${P}/auth/login`,
  AUTH_ME: `${P}/auth/me`,
  AUTH_PROFILE: `${P}/auth/profile`,
  AUTH_CHANGE_PASSWORD: `${P}/auth/change-password`,
  AUTH_FORGOT_PASSWORD: `${P}/auth/forgot-password`,

  // Hotels
  HOTELS: `${P}/hotels`,
  HOTEL_DETAIL: (id) => `${P}/hotels/${id}`,
  HOTEL_ROOMS: (id) => `${P}/hotels/${id}/rooms`,

  // Cities
  CITIES: `${P}/cities`,
  BOOKINGS: `${P}/bookings`,
  BOOKING_DETAIL: (id) => `${P}/bookings/${id}`,
  BOOKING_CANCEL: (id) => `${P}/bookings/${id}/cancel`,

  // Reviews
  REVIEWS: `${P}/reviews`,
  REVIEWS_HOTEL: (hotelId) => `${P}/reviews/hotel/${hotelId}`,
  REVIEW_DETAIL: (id) => `${P}/reviews/${id}`,
  REVIEWS_ME: `${P}/reviews/me`,

  // Payments
  PAYMENTS_PAY: `${P}/payments/pay`,
  PAYMENTS: `${P}/payments`,

  // Notifications
  NOTIFICATIONS: `${P}/notifications`,
  NOTIFICATION_READ: (id) => `${P}/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${P}/notifications/read-all`,

  // AI
  AI_CHAT: `${P}/ai/chat`,
  AI_RECOMMENDATIONS: `${P}/ai/recommendations`,
  AI_TRENDING: `${P}/ai/trending`,
  AI_HISTORY_BASED: `${P}/ai/history-based`,
  AI_TRACK_CLICK: `${P}/ai/track/click`,
};

export const BOOKING_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã huỷ',
  REFUNDED: 'Đã hoàn tiền',
};
