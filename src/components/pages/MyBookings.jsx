import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useBookings } from "../../hooks/useBookings";
import { bookingApi } from "../../api/bookingApi";
import { formatVND, formatDate, formatDateTime } from "../../utils/format";
import { BOOKING_STATUS_LABELS } from "../../utils/constants";
import { useToast } from "../../contexts/ToastContext";

function statusBadge(status) {
  const label = BOOKING_STATUS_LABELS[status] || status;
  const isActive = status === "CONFIRMED" || status === "PAID" || status === "PENDING";
  const cls = isActive
    ? "bg-green-50 text-green-700"
    : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function MyBookings() {
  const { bookings, loading, error, refetch } = useBookings();
  const [cancelling, setCancelling] = useState(null);
  const toast = useToast();

  async function onCancel(id) {
    const ok = window.confirm("Bạn chắc chắn muốn huỷ đơn đặt phòng này?");
    if (!ok) return;

    setCancelling(id);
    try {
      await bookingApi.cancelBooking(id);
      toast.success("Đã huỷ đơn đặt phòng thành công");
      refetch();
    } catch (err) {
      toast.error(err.message || "Không thể huỷ đơn đặt phòng");
    } finally {
      setCancelling(null);
    }
  }

  if (loading) {
    return <Container className="py-6"><Spinner text="Đang tải lịch sử đặt phòng..." /></Container>;
  }

  if (error) {
    return <Container className="py-6"><ErrorCard message={error} onRetry={refetch} /></Container>;
  }

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-900">Lịch sử đặt phòng</h1>
        <div className="flex gap-2">
          <Link to="/hotels"><Button variant="primary">Tìm chỗ nghỉ</Button></Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-6 mt-4 text-slate-600">
          Bạn chưa có đơn đặt phòng nào.
          <div className="mt-3">
            <Link to="/hotels"><Button variant="primary">Bắt đầu đặt phòng</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="font-extrabold text-slate-900">{b.hotel_name}</div>
                  <div className="text-sm text-slate-600 mt-1">{b.hotel_address}</div>

                  <div className="mt-3 text-sm text-slate-700 space-y-1">
                    <div><b>Phòng:</b> {b.room_name || "-"}</div>
                    <div><b>Ngày:</b> {formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
                    <div><b>Phương thức:</b> {b.payment_method === "online" ? "Thanh toán online" : "Thanh toán tại khách sạn"}</div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Mã đơn: {b.id} • Tạo lúc: {formatDateTime(b.created_at)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-600">Tổng</div>
                  <div className="text-xl font-extrabold text-slate-900">{formatVND(b.total_price)}</div>

                  <div className="mt-2">{statusBadge(b.status)}</div>

                  <div className="mt-3 flex gap-2 justify-end">
                    {b.hotel_id && (
                      <Link to={`/hotels/${b.hotel_id}`}>
                        <Button variant="secondary">Xem khách sạn</Button>
                      </Link>
                    )}

                    {(b.status === "CONFIRMED" || b.status === "PENDING") && (
                      <Button
                        variant="secondary"
                        onClick={() => onCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? "Đang huỷ..." : "Huỷ đơn"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
