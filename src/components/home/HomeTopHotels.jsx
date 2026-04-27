import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useHotels } from "../../hooks/useHotels";
import { formatVND } from "../../utils/format";

/**
 * Section "Chỗ nghỉ được đánh giá cao" — top 4 khách sạn theo rating giảm dần.
 */
export default function HomeTopHotels() {
  const navigate = useNavigate();

  // useMemo để filters object không bị tạo mới mỗi render → hook không fetch lại liên tục
  const filters = useMemo(() => ({ sort_by: "rating", sort_order: "DESC", limit: 4 }), []);
  const { hotels, loading, error, refetch } = useHotels(filters);

  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Chỗ nghỉ được đánh giá cao</h2>
          <p className="text-sm text-slate-600 mt-1">Top theo điểm rating</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/hotels")}>Xem tất cả</Button>
      </div>

      {loading ? (
        <Spinner text="Đang tải khách sạn..." />
      ) : error ? (
        <ErrorCard message={error} onRetry={refetch} className="mt-4" />
      ) : hotels.length === 0 ? (
        <Card className="p-6 mt-4 text-center text-slate-600">Chưa có dữ liệu khách sạn.</Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} onClick={() => navigate(`/hotels/${h.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelCard({ hotel: h, onClick }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-sm transition" onClick={onClick}>
      <div className="h-40 bg-slate-200">
        {h.images?.[0] && (
          <img src={h.images[0]} alt={h.name} className="h-40 w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="p-3">
        <div className="font-extrabold text-slate-900">{h.name}</div>
        <div className="text-sm text-slate-600 mt-1">{h.city || h.address}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-600">{h.reviews || 0} đánh giá</span>
          <span className="rounded-md bg-[#003580] px-2 py-1 text-xs font-extrabold text-white">{h.rating}</span>
        </div>
        {h.price_from && (
          <div className="mt-2 text-sm text-slate-700">
            Từ <span className="font-extrabold">{formatVND(h.price_from)}</span>
          </div>
        )}
        <Button
          variant="primary"
          className="w-full mt-3"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  );
}
