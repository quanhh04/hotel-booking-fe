import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const hotelApi = {
  getHotels: (params) => httpClient.get(API_PATHS.HOTELS, params),

  getHotelDetail: (id) => httpClient.get(API_PATHS.HOTEL_DETAIL(id)),

  getHotelRooms: (id, page, limit) =>
    httpClient.get(API_PATHS.HOTEL_ROOMS(id), { page, limit }),
};
