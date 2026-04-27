import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import BookingStatusBadge from "./BookingStatusBadge";
import { formatVND, formatDate, formatDateTime } from "../../utils/format";

/**
 * 1 thẻ trong lịch sử đặt phòng — hiển thị thông tin + các nút hành động.
 *
 * Các action có thể có (tuỳ trạng thái đơn):
 *   - Xem khách sạn  (luôn có nếu booking còn hotel_id)
 *   - Thanh toán      (PENDING + payment_method=online)
 *   - Huỷ đơn         (PENDING / CONFIRMED)
 *   - Đánh giá / Sửa  (CONFIRMED / PAID — sau khi đã ở/đang ở khách sạn)
 */
export default function BookingHistoryCard({
  booking: b,
  review,
  paying, cancelling,
  onPay, onCancel, onReview,
}) {
  const canReview = b.status === "PAID" || b.status === "CONFIRMED";

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* === Thông tin chi tiết === */}
        <div>
          <div className="font-extrabold text-slate-900">{b.hotel_name}</div>
          <div className="text-sm text-slate-600 mt-1">{b.hotel_address}</div>

          <div className="mt-3 text-sm text-slate-700 space-y-1">
            <div><b>Phòng:</b> {b.room_name || "-"}</div>
            <div><b>Ngày:</b> {formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
            <div><b>Phương thức:</b> {b.payment_method === "online" ? "Thanh toán online" : "Thanh toán tại khách sạn"}</div>
          </div>

          {/* Hiển thị review cũ nếu user đã đánh giá */}
          {review && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Đánh giá của bạn</span>
                <span className="rounded-md bg-[#003580] px-2 py-0.5 text-xs font-extrabold text-white">{review.rating}/10</span>
              </div>
              <div className="mt-1 text-sm text-slate-700 line-clamp-2">{review.comment}</div>
            </div>
          )}

          <div className="mt-2 text-xs text-slate-500">
            Mã đơn: {b.id} • Tạo lúc: {formatDateTime(b.created_at)}
          </div>
        </div>

        {/* === Tổng giá + nút hành động === */}
        <div className="text-right">
          <div className="text-sm text-slate-600">Tổng</div>
          <div className="text-xl font-extrabold text-slate-900">{formatVND(b.total_price)}</div>

          <div className="mt-2"><BookingStatusBadge status={b.status} /></div>

          <div className="mt-3 flex gap-2 justify-end flex-wrap">
            {b.hotel_id && (
              <Link to={`/hotels/${b.hotel_id}`}>
                <Button variant="secondary">Xem khách sạn</Button>
              </Link>
            )}

            {b.status === "PENDING" && b.payment_method === "online" && (
              <Button variant="primary" onClick={() => onPay(b.id)} disabled={paying === b.id}>
                {paying === b.id ? "Đang xử lý..." : "💳 Thanh toán"}
              </Button>
            )}

            {(b.status === "CONFIRMED" || b.status === "PENDING") && (
              <Button variant="secondary" onClick={() => onCancel(b.id)} disabled={cancelling === b.id}>
                {cancelling === b.id ? "Đang huỷ..." : "Huỷ đơn"}
              </Button>
            )}

            {canReview && (
              <Button variant="secondary" onClick={() => onReview(b)}>
                {review ? "✏️ Sửa đánh giá" : "⭐ Đánh giá"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
