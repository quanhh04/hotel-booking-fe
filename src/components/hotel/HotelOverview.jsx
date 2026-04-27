import Card from "../ui/Card";
import Button from "../ui/Button";

/**
 * Khu vực mô tả tổng quan + danh sách tiện ích + thông tin tìm kiếm.
 */
export default function HotelOverview({ hotel, searchInfo, onScrollToRooms }) {
  const description = hotel.description
    || "Chỗ nghỉ này có vị trí thuận tiện, phù hợp đi công tác hoặc du lịch.";
  const amenities = hotel.amenities?.length ? hotel.amenities : [];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900">Tổng quan</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{description}</p>
        </div>
        <div className="hidden sm:block">
          <Button variant="primary" onClick={onScrollToRooms}>Xem chỗ trống</Button>
        </div>
      </div>

      {amenities.length > 0 && (
        <>
          <h3 className="mt-4 font-extrabold text-slate-900">Tiện ích</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span key={a} className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">{a}</span>
            ))}
          </div>
        </>
      )}

      {/* Hiển thị lại tham số user đã chọn ở Home (nếu có) để xác nhận họ đang xem đúng chuyến đi */}
      {(searchInfo.checkIn || searchInfo.checkOut || searchInfo.guests) && (
        <div className="mt-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Thông tin tìm kiếm:</span>{" "}
          {searchInfo.checkIn ? `Nhận phòng: ${searchInfo.checkIn}` : ""}{" "}
          {searchInfo.checkOut ? `• Trả phòng: ${searchInfo.checkOut}` : ""}{" "}
          {searchInfo.guests ? `• Khách: ${searchInfo.guests}` : ""}
        </div>
      )}
    </Card>
  );
}
