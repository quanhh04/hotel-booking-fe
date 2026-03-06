import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../data/hotels";
import { useAuth } from "../auth/AuthContext";
import { cancelBooking, getBookingsByUser } from "../services/bookingService";

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso || "";
  }
}

export default function MyBookings() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  const bookings = useMemo(() => getBookingsByUser(user.id), [user.id, tick]);

  function onCancel(id) {
    const ok = window.confirm("Bạn chắc chắn muốn huỷ đơn đặt phòng này?");
    if (!ok) return;

    cancelBooking(id, user.id);
    setTick((x) => x + 1);
  }

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-900">Lịch sử đặt phòng</h1>
        <div className="flex gap-2">
          <Link to="/hotels?deal=1">
            <Button variant="secondary">Xem ưu đãi</Button>
          </Link>
          <Link to="/hotels">
            <Button variant="primary">Tìm chỗ nghỉ</Button>
          </Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-6 mt-4 text-slate-600">
          Bạn chưa có đơn đặt phòng nào.
          <div className="mt-3">
            <Link to="/hotels">
              <Button variant="primary">Bắt đầu đặt phòng</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="font-extrabold text-slate-900">{b.hotelName}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {b.city} • {b.address}
                  </div>

                  <div className="mt-3 text-sm text-slate-700 space-y-1">
                    <div><b>Phòng:</b> {b.roomType || "-"}</div>
                    <div><b>Ngày:</b> {b.checkIn} → {b.checkOut} • <b>{b.nights}</b> đêm</div>
                    <div><b>Khách:</b> {b.guests} • <b>Số phòng:</b> {b.rooms}</div>
                    {Number(b.discountPercent || 0) > 0 && (
                      <div className="text-xs text-[#008234] font-semibold">
                        Ưu đãi: giảm {b.discountPercent}% (mock)
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Mã đơn: {b.id} • Tạo lúc: {fmtTime(b.createdAt)}
                    {b.cancelledAt ? ` • Huỷ lúc: ${fmtTime(b.cancelledAt)}` : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-600">Tổng</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {formatVND(b.total)}
                  </div>

                  <div className="mt-2">
                    {b.status === "CONFIRMED" ? (
                      <span className="inline-flex rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs font-semibold">
                        Đã xác nhận
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-50 text-red-700 px-2 py-1 text-xs font-semibold">
                        Đã huỷ
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2 justify-end">
                    <Link to={`/hotels/${b.hotelId}`}>
                      <Button variant="secondary">Xem khách sạn</Button>
                    </Link>

                    {b.status === "CONFIRMED" && (
                      <Button variant="secondary" onClick={() => onCancel(b.id)}>
                        Huỷ đơn
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