import Card from "../ui/Card";
import Input from "../ui/Input";
import DateInput from "../ui/DateInput";
import Button from "../ui/Button";

/**
 * Thanh tìm kiếm khách sạn ở trang chủ.
 * Tất cả state (city, checkIn, checkOut, guests) đặt ở component cha
 * vì còn dùng cho "Tìm kiếm nhanh" theo điểm đến.
 */
export default function HomeSearchBar({
  city, setCity,
  checkIn, setCheckIn,
  checkOut, setCheckOut,
  guests, setGuests,
  onSubmit,
}) {
  return (
    <Card className="border-4 border-[#febb02] p-3 md:p-4">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-600">Điểm đến</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1"
              placeholder="Nhập thành phố (VD: Đà Nẵng)"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-600">Ngày nhận phòng</label>
            <DateInput value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-600">Ngày trả phòng</label>
            <DateInput value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-600">Khách</label>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value || 1))}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Button type="submit" variant="primary" className="w-full h-11">Tìm</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
