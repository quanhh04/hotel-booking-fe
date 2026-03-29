import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const cityApi = {
  getCities: (limit) => httpClient.get(API_PATHS.CITIES, { limit }),
};
