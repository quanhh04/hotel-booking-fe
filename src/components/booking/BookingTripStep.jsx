import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import DateInput from "../ui/DateInput";

/**
 * Bước 1 — Form nhập thông tin chuyến đi + thông tin liên hệ + thanh toán.
 *
 * Component này KHÔNG quản lý state — toàn bộ state nằm ở Booking.jsx (component cha).
 * Lý do: state cần dùng lại ở bước 2 (xem lại) và bước 3 (gửi lên API),
 * nên đặt ở cha rồi truyền xuống là gọn nhất.
 */
export default function BookingTripStep({
  hotel,
  room,
  nights,
  // Trip details
  checkIn, setCheckIn,
  checkOut, setCheckOut,
  guests, setGuests,
  // User details
  fullName, setFullName,
  email, setEmail,
  phone, setPhone,
  // Payment
  paymentMethod, setPaymentMethod,
  specialRequests, setSpecialRequests,
  // Action
  onNext,
}) {
  return (
    <>
      {/* === Card 1: Chi tiết chuyến đi === */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-slate-900">Chi tiết chuyến đi</h2>
          <Link to={`/hotels/${hotel.id}`} className="text-sm text-[#0071c2] hover:underline">
            Sửa lựa chọn
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Ngày nhận phòng</label>
            <DateInput value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Ngày trả phòng</label>
            <DateInput value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Số khách</label>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value || 1))}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-700">
          <b>Đã chọn:</b> {room?.name || "Phòng"} • <b>{nights}</b> đêm
        </div>
      </Card>

      {/* === Card 2: Thông tin của bạn === */}
      <Card className="p-4">
        <h2 className="font-extrabold text-slate-900">Thông tin của bạn</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Họ và tên</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>
      </Card>

      {/* === Card 3: Thanh toán === */}
      <Card className="p-4">
        <h2 className="font-extrabold text-slate-900">Thông tin bổ sung</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Phương thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
            >
              <option value="pay_at_hotel">Thanh toán tại khách sạn</option>
              <option value="online">Thanh toán online</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-600">Yêu cầu đặc biệt (tuỳ chọn)</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
            placeholder="VD: phòng tầng cao, giường phụ..."
          />
        </div>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="primary" className="h-11 px-6" onClick={onNext}>Tiếp tục</Button>
      </div>
    </>
  );
}
