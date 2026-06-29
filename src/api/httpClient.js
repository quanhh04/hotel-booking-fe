const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';

function buildHeaders(hasBody) {//tạo phần header cho request
  const headers = {};
  if (hasBody) headers['Content-Type'] = 'application/json';

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';

  const filtered = {};//tạo object rỗng để lưu các tham số hợp lệ
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value;
    }
  }

  const qs = new URLSearchParams(filtered).toString();
  return qs ? '?' + qs : '';
}

async function handleResponse(res) { //xử lý phản hồi từ server
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  }

  let data = null;
  try { data = await res.json(); } catch { }

  if (!res.ok) {
    throw new Error(data?.message || `Lỗi ${res.status}`);
  }

  return data;
}

async function request(method, url, { body, params } = {}) {
  const hasBody = body !== undefined && body !== null;
  const fullUrl = BASE_URL + url + buildQueryString(params);

  let res;//khai báo biến res để chứa response từ server
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

const httpClient = {
  get:   (url, params) => request('GET',    url, { params }),
  post:  (url, body)   => request('POST',   url, { body }),
  put:   (url, body)   => request('PUT',    url, { body }),
  patch: (url, body)   => request('PATCH',  url, { body }),
  del:   (url)         => request('DELETE', url),
};

export default httpClient;
