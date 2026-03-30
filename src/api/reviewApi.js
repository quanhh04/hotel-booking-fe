import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const reviewApi = {
  getHotelReviews: (hotelId, page, limit) =>
    httpClient.get(API_PATHS.REVIEWS_HOTEL(hotelId), { page, limit }),

  createReview: (data) => httpClient.post(API_PATHS.REVIEWS, data),

  updateReview: (id, data) =>
    httpClient.put(API_PATHS.REVIEW_DETAIL(id), data),

  deleteReview: (id) => httpClient.del(API_PATHS.REVIEW_DETAIL(id)),

  getMyReviews: () => httpClient.get(API_PATHS.REVIEWS_ME),
};
