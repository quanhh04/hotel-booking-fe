# Hotel Booking — Frontend (React + Vite + TailwindCSS)

> Tài liệu phục vụ **giảng dạy**: giải thích đủ để fresher cài đặt, chạy, đọc hiểu cấu trúc và làm theo từ đầu.

---

## 1. Giới thiệu

Frontend cho hệ thống đặt phòng khách sạn, viết bằng:

- **React 19** — UI library.
- **Vite 7** — bundler / dev server (HMR siêu nhanh).
- **React Router v7** — routing client-side.
- **TailwindCSS 3** — utility-first CSS.
- **Context API + custom hooks** — state management nhẹ (không Redux).
- **Fetch API** (qua wrapper `httpClient`) — gọi backend.

Trang người dùng: tìm khách sạn → xem chi tiết → đặt phòng → thanh toán → đánh giá. Khu vực admin có CRUD toàn bộ resource.

---

## 2. Yêu cầu hệ thống

| Tool    | Phiên bản |
| ------- | --------- |
| Node.js | **>= 20** |
| npm     | đi kèm Node |

Backend đi kèm: xem `../smart-hotel-booking`. Mặc định FE proxy `/api` → `http://localhost:3000`.

---

## 3. Cài đặt nhanh

```bash
cd hotel-booking-fe
npm install

# Tạo file env (xem mục 4)
# .env.development có sẵn template

npm run dev
```

Mở http://localhost:5173 trong trình duyệt.

---

## 4. Biến môi trường

Vite chỉ expose biến có prefix **`VITE_`** ra browser (qua `import.meta.env`). Đó là điểm khác Node.

Project có 2 file:

```env
# .env.development  ← khi chạy `npm run dev`
VITE_API_URL=                      # để trống → dùng đường dẫn tương đối /api → Vite proxy
VITE_API_PREFIX=/api
VITE_CLOUDINARY_CLOUD=dpxl15qqg
VITE_CLOUDINARY_PRESET=hotel_uploads

# .env.production   ← khi build
VITE_API_URL=https://your-backend-domain.com   # ép gọi thẳng tới BE production
VITE_API_PREFIX=
```

> 🔎 **Vì sao có 2 chế độ?**
>
> - **Dev**: BE chạy `localhost:3000`, FE chạy `localhost:5173` → khác origin → CORS phiền. Giải pháp: cấu hình `vite.config.js` proxy `/api` về `localhost:3000` → FE gọi cùng origin, không cần CORS.
> - **Prod**: build ra static file, deploy ở domain khác → cần biết URL tuyệt đối của BE → set `VITE_API_URL`.

---

## 5. Run app

| Lệnh                | Tác dụng |
| ------------------- | -------- |
| `npm run dev`       | Dev server (Vite) ở `:5173`, HMR. |
| `npm run build`     | Build production ra `dist/`. |
| `npm run preview`   | Serve thử `dist/` (không phải dev server). |
| `npm run lint`      | Chạy ESLint trên toàn project. |

---

## 6. Kiến trúc tổng thể

### 6.1. Sơ đồ luồng app

```
index.html
  └─ <div id="root"></div>
        ▲ ReactDOM.createRoot(...).render(<App />)
        │
   src/main.jsx
        │
        ▼
   src/App.jsx
        │   <AuthProvider>           ← state đăng nhập (global)
        │     <ToastProvider>        ← state toast (global)
        │       <RouterProvider router={router} />
        │     </ToastProvider>
        │   </AuthProvider>
        ▼
   src/router.jsx
        │   định nghĩa các URL và component đi kèm
        ▼
   <AppLayout> hoặc <AdminLayout>
        │
        ▼
   <Page Component>  (Home, Hotels, Booking, …)
        │   gọi custom hook (useHotels, useBookings, …)
        │       ↓
        │   useFetch(apiCall, deps)  ← hook chung
        │       ↓
        │   xxxApi.get(...)          ← module API
        │       ↓
        │   httpClient.get(...)      ← fetch wrapper, gắn token
        │       ↓
        │   Backend Express
```

### 6.2. Cấu trúc thư mục

```
hotel-booking-fe/
├── public/                       # asset tĩnh (favicon, ...)
├── src/
│   ├── main.jsx                  # entry: mount React vào #root
│   ├── App.jsx                   # bọc các Provider + RouterProvider
│   ├── router.jsx                # định nghĩa routes
│   ├── index.css                 # Tailwind + animation custom
│   │
│   ├── api/                      # ─── tầng GỌI API ──────────────
│   │   ├── httpClient.js         # wrapper fetch (header, query, error)
│   │   ├── authApi.js            # login, register, getMe…
│   │   ├── hotelApi.js
│   │   ├── bookingApi.js
│   │   ├── paymentApi.js
│   │   ├── reviewApi.js
│   │   ├── notificationApi.js
│   │   ├── cityApi.js
│   │   ├── aiApi.js
│   │   └── adminApi.js
│   │
│   ├── hooks/                    # ─── custom hooks ─────────────
│   │   ├── useFetch.js           # hook GENERIC: loading/error/data/refetch
│   │   ├── useHotels.js
│   │   ├── useHotelDetail.js
│   │   ├── useBookings.js
│   │   ├── useReviews.js
│   │   └── useAiRecommendations.js
│   │
│   ├── contexts/                 # ─── state global ─────────────
│   │   ├── AuthContext.jsx       # user, login, register, logout
│   │   └── ToastContext.jsx      # toast.success / .error / .info
│   │
│   ├── components/
│   │   ├── pages/                # mỗi page (Home, Booking, …) — orchestrator
│   │   ├── layout/               # AppLayout, Header, Footer, RequireAuth, NotificationBell
│   │   ├── home/                 # sub-component cho trang Home
│   │   ├── hotel/                # sub-component cho HotelDetail
│   │   ├── booking/              # sub-component cho Booking (stepper, summary…)
│   │   ├── my-bookings/          # sub-component cho MyBookings
│   │   ├── admin/                # các trang admin
│   │   ├── shared/               # component dùng chung
│   │   └── ui/                   # primitive UI (Button, Modal, …)
│   │
│   └── utils/                    # date, format, currency, …
│
├── .env.development
├── .env.production
├── vite.config.js                # cấu hình Vite + proxy /api
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

---

## 7. Các pattern chính (giảng dạy)

### 7.1. `httpClient` — tại sao cần wrapper quanh `fetch`?

`fetch` thuần thiếu rất nhiều thứ phải lặp lại mỗi lần gọi:

- Gắn `Authorization: Bearer <token>` (lấy từ `localStorage`).
- `Content-Type: application/json` khi có body.
- Build query string từ object filter.
- Parse response JSON, **throw nếu status >= 400** (mặc định `fetch` không throw cho HTTP error — đây là lỗi ngầm cực phổ biến).

Tất cả gom vào `src/api/httpClient.js`. Mọi `xxxApi.js` chỉ định URL + body → gọn:

```js
// src/api/hotelApi.js
import http from './httpClient';
export const hotelApi = {
  getHotels: (filters) => http.get('/hotels', filters),
  getHotelById: (id) => http.get(`/hotels/${id}`),
};
```

### 7.2. `useFetch` — hook GENERIC

`useFetch(apiCall, deps)` đóng gói `useEffect` + 3 state (`data`, `loading`, `error`) + `refetch`. Mọi hook dữ liệu khác (`useHotels`, `useBookings`, …) chỉ cần:

```js
export function useHotels(filters) {
  const key = JSON.stringify(filters);
  const { data, loading, error, refetch } = useFetch(
    () => hotelApi.getHotels(filters),
    [key]
  );
  return { hotels: data?.hotels || [], total: data?.total || 0, loading, error, refetch };
}
```

> ⚠️ `JSON.stringify(filters)` để dependency array so sánh được — nếu truyền thẳng `filters` (object), React sẽ thấy reference khác mỗi render → re-fetch vô hạn.

### 7.3. `AuthContext` — quản lý đăng nhập GLOBAL

Lưu `user` ở state, expose qua `useAuth()`:

```jsx
const { user, loading, login, register, logout } = useAuth();
```

Khi mở app:

1. Provider đọc token từ `localStorage`.
2. Có token → gọi `authApi.getMe()` để verify + lấy user → set state.
3. Token hỏng → xoá khỏi `localStorage`.
4. Trong lúc verify → `loading = true` (UI chờ).

Login/Register: gọi BE → lưu token → gọi `getMe()` → set user.

### 7.4. `RequireAuth` — guard cho route cần đăng nhập

```jsx
<RequireAuth><Booking /></RequireAuth>
```

Component này dùng `useAuth()` — nếu `loading` thì show spinner; nếu `!user` thì `<Navigate to="/login" />`; nếu OK thì render children. Pattern này gọn và quen thuộc trong mọi React app.

### 7.5. Page = orchestrator, sub-component = render UI

Trang lớn (Booking, Home, HotelDetail, MyBookings) đã được **chia nhỏ**:

- **Page**: giữ state, gọi hook, điều phối.
- **Sub-component** (`booking/BookingStepper.jsx`, `home/HomeSearchBar.jsx`, …): nhận props, render JSX, không có logic phức tạp.

Lợi ích: học viên đọc page chỉ ~150 dòng là nắm được luồng, đọc sub-component là hiểu UI từng phần.

### 7.6. Toast (thông báo nhỏ góc màn hình)

`ToastContext` cung cấp `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`. Tự động biến mất sau 4s. Dùng trong các page:

```jsx
const toast = useToast();
toast.success('Đặt phòng thành công!');
```

---

## 8. Routing (React Router v7)

```js
// src/router.jsx (rút gọn)
createBrowserRouter([
  {
    element: <AppLayout />,    // shared header + footer
    children: [
      { path: '/',        element: <Home /> },
      { path: '/hotels',  element: <Hotels /> },
      { path: '/hotels/:id', element: <HotelDetail /> },
      { path: '/booking/:id', element: <RequireAuth><Booking /></RequireAuth> },
      { path: '/me/bookings', element: <RequireAuth><MyBookings /></RequireAuth> },
      // ...
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [{ index: true, element: <Dashboard /> }, /* ... */],
  },
]);
```

**`createBrowserRouter`** dùng History API (URL thật, không có `#`). Cần BE/serve config rewrite mọi request về `index.html` khi deploy (Vite preview & Netlify/Vercel mặc định OK).

`<Outlet />` trong `AppLayout` là vị trí render route con. Đây là điểm dễ gây bối rối cho người mới.

---

## 9. TailwindCSS — vì sao dùng utility-first?

Thay vì viết:

```css
.button-primary { background: #2563eb; padding: 8px 16px; border-radius: 8px; }
```

→ trong JSX dán thẳng class:

```jsx
<button className="bg-blue-600 px-4 py-2 rounded-lg">Đặt ngay</button>
```

Ưu điểm:
- Không phải nghĩ tên class.
- Không phải mở/đóng file CSS riêng.
- Dead-code elimination tự động (Tailwind chỉ build class thực sự dùng).
- Đồng bộ design system (mọi `bg-blue-600` giống nhau toàn app).

`tailwind.config.js` quét `src/**/*.{js,jsx}` để biết class nào đang dùng.

---

## 10. Vite — vì sao nhanh?

- **Dev**: không bundle. Browser request `import './foo.jsx'` → Vite serve thẳng module ESM. Sửa code → HMR cập nhật chỉ module thay đổi.
- **Build**: gọi Rollup để bundle ra `dist/` (minify, tree-shake, code-split tự động).

So với Webpack/CRA cũ (bundle lại toàn bộ mỗi lần start), Vite chỉ mất ~200ms để mở dev server cho project cỡ vừa.

`@vitejs/plugin-react` thêm hỗ trợ JSX + Fast Refresh (giữ state khi sửa component).

---

## 11. Tóm tắt cách tạo project tương tự từ đầu (cho fresher)

```bash
# 1. Scaffold
npm create vite@latest my-fe -- --template react
cd my-fe
npm install

# 2. Cài Tailwind
npm i -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# 3. Sửa tailwind.config.js → content: ["./index.html","./src/**/*.{js,jsx}"]

# 4. Trong src/index.css thêm 3 dòng:
#   @tailwind base;
#   @tailwind components;
#   @tailwind utilities;

# 5. Cài routing
npm i react-router-dom
```

**Bước 1 — `httpClient.js`**: viết wrapper `fetch` (xem mục 7.1) để mọi API call đi qua 1 chỗ.

**Bước 2 — `xxxApi.js` cho mỗi resource**: chỉ định URL + tham số.

**Bước 3 — `useFetch.js`**: hook generic loading/error/data/refetch.

**Bước 4 — `AuthContext`**: quản lý user. Login/Register lưu token vào `localStorage`.

**Bước 5 — Routing**: `createBrowserRouter` + `RouterProvider`. Layout dùng `<Outlet />`.

**Bước 6 — `RequireAuth`**: HOC bảo vệ route cần đăng nhập.

**Bước 7 — Build page**: dùng hook trong page, chia sub-component khi component > ~200 dòng.

**Bước 8 — Vite proxy** (`vite.config.js`): để dev không vướng CORS:

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true,
              rewrite: p => p.replace(/^\/api/, '') }
  }
}
```

---

## 12. Quy ước code

- **Component**: PascalCase (`BookingStepper.jsx`).
- **Hook**: bắt buộc bắt đầu bằng `use` (`useFetch`).
- **Page**: đặt trong `components/pages/`, là orchestrator.
- **Sub-component theo tính năng**: đặt trong `components/<feature>/` (vd `booking/`, `home/`).
- **Util thuần (không phụ thuộc React)**: trong `utils/`.
- **Mọi API call**: đi qua `xxxApi.js → httpClient.js`. KHÔNG `fetch` trực tiếp trong component.
- **Mọi data fetching**: đi qua hook (`useXxx`). Component không tự gọi API.

---

## 13. Troubleshooting

| Triệu chứng | Cách fix |
| ----------- | -------- |
| `Failed to fetch` ở dev | Backend chưa chạy (`npm start` ở `smart-hotel-booking`). |
| CORS error ở dev | Đang gọi thẳng `http://localhost:3000` thay vì `/api`. Đảm bảo `VITE_API_URL` trong `.env.development` để TRỐNG. |
| 401 khi gọi API cần login | Token hết hạn / sai. Đăng xuất rồi đăng nhập lại. |
| Refresh trang `/me/bookings` ra 404 trên prod | Server static thiếu rewrite. Cấu hình `try_files $uri /index.html` (nginx) hoặc `_redirects` (Netlify). |
| `useEffect` chạy 2 lần ở dev | Đó là `<React.StrictMode>` (đã được tắt trong `main.jsx` của project này). Hành vi bình thường ở dev, không xảy ra ở prod. |
| Tailwind class không apply | Kiểm tra `content` trong `tailwind.config.js` có quét đúng folder `src/` chưa. |

---

## 14. Các file đáng đọc để hiểu nhanh

> Mỗi file đã có doc block / comment tiếng Việt ở đầu.

1. `src/api/httpClient.js` — học fetch wrapper.
2. `src/hooks/useFetch.js` — học custom hook fetch.
3. `src/contexts/AuthContext.jsx` — học Context + lifecycle.
4. `src/router.jsx` — học routing.
5. `src/components/pages/Booking.jsx` — page điển hình orchestrate sub-component.
6. `src/components/booking/BookingStepper.jsx` — sub-component thuần render.

---

**Chúc giảng dạy vui!** Cấu trúc đã được tinh gọn để fresher đọc tuyến tính từ trên xuống là hiểu được app.
