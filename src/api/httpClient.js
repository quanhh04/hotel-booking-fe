const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function buildHeaders(hasBody) {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw { message: 'Phiên đăng nhập đã hết hạn', status: 401 };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw {
      message: (data && data.message) || `Lỗi ${res.status}`,
      status: res.status,
    };
  }

  return data;
}

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
    throw { message: 'Không thể kết nối đến server', status: 0 };
  }

  return handleResponse(res);
}

const httpClient = {
  get: (url, params) => request('GET', url, { params }),
  post: (url, body) => request('POST', url, { body }),
  put: (url, body) => request('PUT', url, { body }),
  patch: (url, body) => request('PATCH', url, { body }),
  del: (url) => request('DELETE', url),
};

export default httpClient;
