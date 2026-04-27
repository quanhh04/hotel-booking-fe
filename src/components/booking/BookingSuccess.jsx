import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";

/**
 * Màn hình hiển thị sau khi đặt phòng thành công.
 * - Nếu thanh toán online: nhắc user đi tới trang thanh toán.
 * - Nếu trả tại khách sạn: chỉ cần xem lịch sử.
 */
export default function BookingSuccess({ bookingId, paymentMethod, hotel }) {
  return (
    <Container className="py-10">
      <Card className="p-6 text-center">
        <div className="text-2xl font-extrabold text-slate-900">✅ Đặt phòng thành công!</div>
        <div className="mt-2 text-sm text-slate-600">
          Mã đơn: <span className="font-semibold">{bookingId}</span>
        </div>

        {paymentMethod === "online" && (
          <Card className="mt-4 p-4 border-2 border-[#febb02] bg-[#fff8e1] text-left">
            <div className="text-sm font-semibold text-slate-900">💳 Thanh toán online</div>
            <div className="text-xs text-slate-600 mt-1">
              Đơn đặt phòng đang chờ thanh toán. Bấm nút bên dưới để thanh toán ngay.
            </div>
            <div className="mt-3">
              <Link to="/me/bookings"><Button variant="primary">Đi tới thanh toán →</Button></Link>
            </div>
          </Card>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/me/bookings"><Button variant="primary">Xem lịch sử đặt phòng</Button></Link>
          <Link to={`/hotels/${hotel.id}`}><Button variant="secondary">Quay lại khách sạn</Button></Link>
        </div>
      </Card>
    </Container>
  );
}
