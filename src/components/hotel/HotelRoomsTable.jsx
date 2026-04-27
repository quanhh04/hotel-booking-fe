import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../../utils/format";

/**
 * Bảng danh sách phòng của khách sạn.
 * Có id="rooms" để nút "Xem chỗ trống" có thể scroll tới.
 *
 * - Nếu user đăng nhập → nút "Đặt" đi thẳng tới /booking/:hotelId
 * - Nếu chưa đăng nhập → nút "Đăng nhập để đặt" — sau khi login sẽ quay lại đây
 */
export default function HotelRoomsTable({ hotelId, rooms, isLoggedIn }) {
  const bookingUrl     = (roomId) => `/booking/${hotelId}?roomId=${encodeURIComponent(roomId)}`;
  const loginToBookUrl = (roomId) => `/login?returnTo=${encodeURIComponent(bookingUrl(roomId))}`;

  return (
    <Card className="p-4" id="rooms">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-extrabold text-slate-900">Chọn phòng</h2>
        <div className="text-xs text-slate-600">Giá hiển thị: /đêm</div>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600">Chưa có thông tin phòng.</div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b">
                <th className="py-2">Loại phòng</th>
                <th className="py-2">Chi tiết</th>
                <th className="py-2 text-right">Giá</th>
                <th className="py-2 text-right">Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="py-3 font-semibold text-slate-900">{r.name}</td>
                  <td className="py-3 text-slate-700">
                    <div>{r.bed}</div>
                    <div className="text-xs text-slate-500">{r.size}</div>
                    {r.max_guests && <div className="text-xs text-slate-500">Tối đa {r.max_guests} khách</div>}
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-extrabold text-slate-900">{formatVND(r.price_per_night || r.price)}</div>
                    <div className="text-xs text-slate-500">Đã gồm thuế/phí</div>
                  </td>
                  <td className="py-3 text-right">
                    {isLoggedIn ? (
                      <Link to={bookingUrl(r.id)}><Button variant="primary">Đặt</Button></Link>
                    ) : (
                      <Link to={loginToBookUrl(r.id)}><Button variant="primary">Đăng nhập để đặt</Button></Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
