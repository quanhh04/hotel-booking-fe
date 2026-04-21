const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';

/**
 * Lấy JWT token từ localStorage.
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Tạo headers cho request.
 * - Nếu có body → thêm Content-Type: application/json
 * - Nếu có token → thêm Authorization: Bearer ...
 */
function buildHeaders(hasBody) {
  const headers = {};
  if (hasBody) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

/**
 * Chuyển object params thành query string.
 * Bỏ qua các giá trị undefined, null, rỗng.
 * Ví dụ: { page: 1, keyword: 'abc' } → '?page=1&keyword=abc'
 */
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

/**
 * Xử lý response từ server.
 * - 401 → xoá token, redirect về login
 * - Lỗi khác → throw error với message từ server
 */
async function handleResponse(res) {
  // Token hết hạn → đăng xuất
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    // throw new Error('Phiên đăng nhập đã hết hạn');
  }

  // Parse JSON body (có thể không có body)
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Response không có JSON body
  }

  // Nếu lỗi → throw error
  if (!res.ok) {
    const message = (data && data.message) || `Lỗi ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Gửi HTTP request.
 * @param {string} method - GET, POST, PUT, PATCH, DELETE
 * @param {string} url - Đường dẫn API (VD: /api/hotels)
 * @param {object} options - { body?, params? }
 */
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
    throw new Error('Không thể kết nối đến server');
  }

  return handleResponse(res);
}

/**
 * HTTP client — wrapper gọn cho fetch API.
 *
 * Cách dùng:
 *   httpClient.get('/api/hotels', { page: 1 })
 *   httpClient.post('/api/bookings', { room_type_id: 1, check_in: '...' })
 */
const httpClient = {
  get:   (url, params) => request('GET', url, { params }),
  post:  (url, body)   => request('POST', url, { body }),
  put:   (url, body)   => request('PUT', url, { body }),
  patch: (url, body)   => request('PATCH', url, { body }),
  del:   (url)         => request('DELETE', url),
};

export default httpClient;
