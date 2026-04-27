import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../../utils/format";

/**
 * Sidebar bên phải — Hiển thị giá thấp nhất + đánh giá + nút CTA.
 */
export default function HotelPriceSidebar({ hotel, minPrice, ratingLabel, isLoggedIn, onScrollToRooms }) {
  return (
    <Card className="p-4 border-2 border-[#febb02]">
      <div className="text-sm text-slate-600">Giá từ</div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900">{formatVND(minPrice)}</div>
      <div className="text-xs text-slate-500 mt-1">/đêm</div>

      <div className="mt-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Đánh giá</span>
          <span className="font-semibold">{ratingLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Điểm</span>
          <span className="font-semibold">{hotel.rating}</span>
        </div>
      </div>

      <div className="mt-4">
        <Button variant="primary" className="w-full" onClick={onScrollToRooms}>
          {isLoggedIn ? "Chọn phòng để đặt" : "Xem phòng"}
        </Button>
      </div>

      {!isLoggedIn && (
        <div className="mt-3 text-xs text-slate-600">
          * Bạn vẫn xem được phòng, nhưng cần đăng nhập để đặt.
        </div>
      )}
    </Card>
  );
}
