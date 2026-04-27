import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useFetch } from "../../hooks/useFetch";
import { cityApi } from "../../api/cityApi";
import { formatVND } from "../../utils/format";

/**
 * Section "Khám phá Việt Nam" — Lưới các thành phố (lấy 6 cái).
 * Dữ liệu từ /api/cities (BE trả { cities: [...] } hoặc thẳng mảng).
 */
export default function HomeDestinations({ onPick }) {
  const { data, loading, error, refetch } = useFetch(
    () => cityApi.getCities(6),
    []
  );

  const destinations = data?.cities || data || [];

  return (
    <div className="mt-10">
      <h2 className="text-xl font-extrabold text-slate-900">Khám phá Việt Nam</h2>
      <p className="text-sm text-slate-600 mt-1">Một vài điểm đến nổi bật.</p>

      {loading ? (
        <Spinner text="Đang tải điểm đến..." />
      ) : error ? (
        <ErrorCard message={error} onRetry={refetch} className="mt-4" />
      ) : destinations.length === 0 ? (
        <Card className="p-6 mt-4 text-center text-slate-600">Chưa có dữ liệu điểm đến.</Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {destinations.map((d) => (
            <DestinationCard key={d.id} destination={d} onClick={() => onPick(d.name)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DestinationCard({ destination: d, onClick }) {
  return (
    <div className="relative overflow-hidden rounded-xl cursor-pointer group" onClick={onClick}>
      {d.thumbnail ? (
        <img
          src={d.thumbnail}
          alt={d.name}
          className="h-44 w-full object-cover group-hover:scale-[1.02] transition"
          loading="lazy"
        />
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-slate-300 to-slate-400" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-white text-lg font-extrabold">{d.name}</div>
        <div className="text-white/90 text-sm mt-1">
          {d.subtitle || `${d.hotel_count} chỗ nghỉ`}
          {d.min_price ? ` • Giá từ ${formatVND(d.min_price)}` : ""}
        </div>
      </div>
    </div>
  );
}
