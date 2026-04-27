/**
 * httpClient — Wrapper mỏng quanh fetch() để mọi API call dùng chung 1 chỗ.
 *
 * Trách nhiệm chính:
 *   1. Tự gắn header `Authorization: Bearer <token>` nếu user đã đăng nhập.
 *   2. Tự gắn `Content-Type: application/json` khi gửi body.
 *   3. Tự build query string từ object params (bỏ giá trị rỗng).
 *   4. Tự parse JSON, throw Error nếu response không OK.
 *   5. Nếu nhận 401 → xoá token + chuyển về /login.
 *
 * Cách dùng:
 *   httpClient.get('/api/hotels', { page: 1 })
 *   httpClient.post('/api/bookings', { room_type_id: 1 })
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';

// Build object headers cho mỗi request
function buildHeaders(hasBody) {
  const headers = {};
  if (hasBody) headers['Content-Type'] = 'application/json';

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

// { page: 1, keyword: 'abc' } → '?page=1&keyword=abc'
// Bỏ qua giá trị undefined / null / chuỗi rỗng để URL gọn.
function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';

  const filtered = {};
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value;
    }
  }

  const qs = new URLSearchParams(filtered).toString();
  return qs ? '?' + qs : '';
}

// Đọc body JSON + xử lý lỗi chung
async function handleResponse(res) {
  // 401 = token hết hạn / không hợp lệ → đăng xuất tự động
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  }

  // Một số response (như DELETE 204) không có body
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    throw new Error(data?.message || `Lỗi ${res.status}`);
  }

  return data;
}

// Hàm lõi: thực hiện 1 HTTP request bất kỳ
async function request(method, url, { body, params } = {}) {
  const hasBody = body !== undefined && body !== null;
  const fullUrl = BASE_URL + url + buildQueryString(params);

  let res;
  try {
    res = await fetch(fullUrl, {
      method,
      headers: buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Lỗi network (mất mạng, server down,...)
    throw new Error('Không thể kết nối đến server');
  }

  return handleResponse(res);
}

// Public API — 5 hàm tiện dụng cho 5 method HTTP phổ biến
const httpClient = {
  get:   (url, params) => request('GET',    url, { params }),
  post:  (url, body)   => request('POST',   url, { body }),
  put:   (url, body)   => request('PUT',    url, { body }),
  patch: (url, body)   => request('PATCH',  url, { body }),
  del:   (url)         => request('DELETE', url),
};

export default httpClient;
