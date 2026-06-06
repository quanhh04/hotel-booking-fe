# Hotel Booking — Frontend

React + Vite + TailwindCSS frontend cho hệ thống đặt phòng khách sạn.

---

## Tech Stack

- **React 19** + **Vite 7** + **React Router v7**
- **TailwindCSS 3** (utility-first)
- **Context API + custom hooks** (state management)
- **Fetch API** (wrapper `httpClient`)

---

## Yêu cầu

| Tool    | Phiên bản |
| ------- | --------- |
| Node.js | >= 20     |
| npm     | đi kèm Node |

Backend: xem `../smart-hotel-booking`. FE proxy `/api` → `http://localhost:3000` khi dev.

---

## Cài đặt

```bash
cd hotel-booking-fe
npm install
npm run dev
```

Mở http://localhost:5173.

---

## Biến môi trường

```env
# .env.development
VITE_API_URL=
VITE_API_PREFIX=/api
VITE_CLOUDINARY_CLOUD=dpxl15qqg
VITE_CLOUDINARY_PRESET=hotel_uploads

# .env.production
VITE_API_URL=https://your-backend-domain.com
VITE_API_PREFIX=
```

---

## Scripts

| Lệnh              | Tác dụng                        |
| ------------------ | ------------------------------- |
| `npm run dev`      | Dev server (Vite HMR) `:5173`  |
| `npm run build`    | Build production → `dist/`      |
| `npm run preview`  | Serve `dist/` locally           |
| `npm run lint`     | ESLint                          |

---

## Cấu trúc thư mục

```
src/
├── api/              # API client modules (httpClient + xxxApi)
├── hooks/            # Custom hooks (useFetch, useHotels, useBookings, ...)
├── contexts/         # AuthContext, ToastContext
├── components/
│   ├── pages/        # Page components (orchestrators)
│   ├── layout/       # AppLayout, Header, Footer, RequireAuth
│   ├── home/         # Home page sub-components
│   ├── hotel/        # Hotel detail sub-components
│   ├── booking/      # Booking flow sub-components
│   ├── my-bookings/  # Booking history sub-components
│   ├── admin/        # Admin panel
│   ├── shared/       # Shared components (AiChatWidget, FiltersSidebar, ...)
│   └── ui/           # Atomic UI (Button, Card, Input, Spinner, ...)
└── utils/            # Constants, format helpers, upload
```

---

## Routes

**Public:**
- `/` — Trang chủ
- `/hotels` — Danh sách khách sạn
- `/hotels/:id` — Chi tiết khách sạn
- `/login`, `/register`, `/forgot-password`

**Protected (yêu cầu đăng nhập):**
- `/booking/:id` — Đặt phòng
- `/me/bookings` — Lịch sử đặt phòng
- `/me/profile` — Thông tin tài khoản
- `/me/reviews` — Đánh giá của tôi

**Admin:**
- `/admin` — Dashboard
- `/admin/hotels`, `/admin/rooms`, `/admin/bookings`, `/admin/users`, `/admin/cities`, `/admin/payments`, `/admin/reviews`

---

## Tính năng chính

- Tìm kiếm & lọc khách sạn (theo thành phố, giá, sao, tiện ích)
- Đặt phòng 3 bước (thông tin → xem lại → xác nhận)
- **Chatbot AI** đặt phòng trực tiếp (Gemini-powered)
- AI gợi ý phòng dựa trên filter
- Thanh toán online / tại khách sạn
- Đánh giá & quản lý review
- Notification real-time (polling 30s)
- Admin CRUD đầy đủ + quản lý ảnh (Cloudinary)

---

## Quy ước

- Component: PascalCase (`BookingStepper.jsx`)
- Hook: prefix `use` (`useFetch`, `useHotels`)
- Mọi API call đi qua `xxxApi.js → httpClient.js`
- Data fetching qua custom hook, không gọi API trực tiếp trong component
- Page = orchestrator, sub-component = render UI
