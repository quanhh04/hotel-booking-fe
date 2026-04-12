import httpClient from './httpClient';
import { API_PATHS } from '../utils/constants';

export const aiApi = {
  chat: (message, sessionId) =>
    httpClient.post(API_PATHS.AI_CHAT, { message, session_id: sessionId }),

  getRecommendations: (params) =>
    httpClient.get(API_PATHS.AI_RECOMMENDATIONS, params),
};
