import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatDate } from "../../utils/format";

/**
 * Bước 2 — Hiển thị lại tất cả thông tin user đã nhập để xác nhận.
 * Chỉ hiển thị, không cho sửa. Muốn sửa thì bấm "Quay lại" về bước 1.
 */
export default function BookingReviewStep({
  hotel, room, checkIn, checkOut, nights, guests,
  fullName, email, paymentMethod, specialRequests,
  onBack, onNext,
}) {
  return (
    <>
      <Card className="p-4">
        <h2 className="font-extrabold text-slate-900">Xem lại thông tin</h2>
        <div className="mt-3 text-sm text-slate-700 space-y-2">
          <div><b>Khách sạn:</b> {hotel.name}</div>
          <div><b>Phòng:</b> {room?.name}</div>
          <div><b>Ngày:</b> {formatDate(checkIn)} → {formatDate(checkOut)} • <b>{nights}</b> đêm</div>
          <div><b>Khách:</b> {guests}</div>
          <div><b>Khách đặt:</b> {fullName} • {email}</div>
          <div><b>Thanh toán:</b> {paymentMethod === "online" ? "Thanh toán online" : "Thanh toán tại khách sạn"}</div>
          {specialRequests.trim() && <div><b>Yêu cầu:</b> {specialRequests.trim()}</div>}
        </div>
      </Card>
      <div className="flex gap-2 justify-between">
        <Button variant="secondary" className="h-11" onClick={onBack}>Quay lại</Button>
        <Button variant="primary" className="h-11 px-6" onClick={onNext}>Tiếp tục</Button>
      </div>
    </>
  );
}
