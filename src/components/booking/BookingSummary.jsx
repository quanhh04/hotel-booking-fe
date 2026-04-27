import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND, formatDate } from "../../utils/format";

/**
 * Sidebar bên phải — Tóm tắt đơn đặt phòng (giá, ngày, tổng).
 * Hiển thị xuyên suốt cả 3 bước, sticky khi cuộn.
 *
 * Lưu ý: total = pricePerNight × số đêm. BE sẽ tự tính lại lúc thanh toán
 * online để đảm bảo client không gửi sai số tiền.
 */
export default function BookingSummary({
  hotel, room, checkIn, checkOut, nights, pricePerNight, total,
}) {
  return (
    <div className="lg:sticky lg:top-4 space-y-3">
      <Card className="p-4 border-2 border-[#febb02]">
        <div className="font-extrabold text-slate-900">Tóm tắt đặt phòng</div>
        <div className="mt-2 text-sm text-slate-700">
          <div className="font-semibold">{hotel.name}</div>
          <div className="text-slate-600">{hotel.address}</div>
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-700 space-y-2">
          <Row label="Phòng" value={room?.name || "-"} />
          <Row
            label="Ngày"
            value={checkIn && checkOut ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : "-"}
          />
          <Row label="Số đêm" value={nights} />
          <Row label="Giá/đêm" value={formatVND(pricePerNight)} />
          <div className="border-t border-slate-200 pt-2 flex justify-between">
            <span className="text-slate-600">Tổng</span>
            <span className="font-extrabold text-slate-900">{formatVND(total)}</span>
          </div>
          <div className="text-xs text-slate-500">* Tổng = giá/đêm × số đêm</div>
        </div>
      </Card>
      <Link to="/me/bookings">
        <Button variant="secondary" className="w-full">Lịch sử đặt phòng</Button>
      </Link>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
