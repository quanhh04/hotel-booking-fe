import httpClient from './httpClient';

const P = import.meta.env.VITE_API_PREFIX ?? '/api';

export const adminApi = {
  // Dashboard
  getStats: () => httpClient.get(`${P}/admin/stats`),
  getRevenue: (startDate, endDate) => httpClient.get(`${P}/admin/revenue`, { start_date: startDate, end_date: endDate }),
  getTopHotels: (sortBy, limit) => httpClient.get(`${P}/admin/top-hotels`, { sort_by: sortBy, limit }),
  getUsers: (page, limit) => httpClient.get(`${P}/admin/users`, { page, limit }),

  // Images
  getImages: (type, limit) => httpClient.get(`${P}/images`, { type, limit }),
  createImage: (url, alt, type) => httpClient.post(`${P}/images`, { url, alt, type }),
  deleteImage: (id) => httpClient.del(`${P}/images/${id}`),
  getHotelImages: (hotelId) => httpClient.get(`${P}/images/hotel/${hotelId}`),
  addHotelImage: (hotelId, imageId, sortOrder) => httpClient.post(`${P}/images/hotel/${hotelId}`, { image_id: imageId, sort_order: sortOrder }),
  removeHotelImage: (hotelId, imageId) => httpClient.del(`${P}/images/hotel/${hotelId}/${imageId}`),

  // Hotels CRUD
  createHotel: (data) => httpClient.post(`${P}/hotels`, data),
  updateHotel: (id, data) => httpClient.put(`${P}/hotels/${id}`, data),
  deleteHotel: (id) => httpClient.del(`${P}/hotels/${id}`),

  // Rooms CRUD
  getRooms: (params) => httpClient.get(`${P}/rooms`, params),
  createRoom: (data) => httpClient.post(`${P}/rooms`, data),
  updateRoom: (id, data) => httpClient.put(`${P}/rooms/${id}`, data),
  deleteRoom: (id) => httpClient.del(`${P}/rooms/${id}`),

  // Bookings
  getAllBookings: (params) => httpClient.get(`${P}/bookings/admin/all`, params),

  // Payments
  getAllPayments: (params) => httpClient.get(`${P}/payments/admin/all`, params),
  refund: (bookingId) => httpClient.post(`${P}/payments/refund`, { booking_id: bookingId }),

  // Cities CRUD
  getCities: (limit) => httpClient.get(`${P}/cities`, { limit }),
  createCity: (data) => httpClient.post(`${P}/cities`, data),
  updateCity: (id, data) => httpClient.put(`${P}/cities/${id}`, data),
  deleteCity: (id) => httpClient.del(`${P}/cities/${id}`),

  // Inventory
  getHotelInventory: (hotelId) => httpClient.get(`${P}/hotels/${hotelId}/inventory`),
  updateInventory: (roomId, data) => httpClient.patch(`${P}/rooms/${roomId}/inventory`, data),
};
