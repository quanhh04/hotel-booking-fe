import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../../utils/format";

export default function HotelCard({ hotel }) {
  const priceOriginal = Number(hotel.price_from || 0);

  const img = hotel.images?.[0];

  return (
    <Card className="p-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Image */}
        <div className="sm:col-span-4">
          <div className="relative">
            {img ? (
              <img
                src={typeof img === "string" ? img : img.url}
                alt={hotel.name}
                className="h-44 w-full rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full rounded-md bg-slate-200" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="sm:col-span-8 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                to={`/hotels/${hotel.id}`}
                className="text-[#0071c2] font-extrabold hover:underline"
              >
                {hotel.name}
              </Link>

              <div className="text-sm text-slate-600 mt-1">
                {hotel.city || hotel.address}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(hotel.amenities || []).slice(0, 6).map((a) => (
                  <span
                    key={a}
                    className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating box */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-semibold text-slate-700">
                  {hotel.rating >= 9
                    ? "Tuyệt hảo"
                    : hotel.rating >= 8.5
                    ? "Rất tốt"
                    : hotel.rating >= 8
                    ? "Tốt"
                    : "Ổn"}
                </span>
                <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
                  {hotel.rating}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {hotel.reviews || 0} đánh giá
              </div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-end justify-between pt-3">
            <div className="text-sm text-slate-600">
              Giá từ{" "}
              <span className="font-extrabold text-slate-900">
                {formatVND(priceOriginal)}
              </span>
              <div className="text-xs text-slate-500">Đã gồm thuế/phí</div>
            </div>

            <Link to={`/hotels/${hotel.id}`}>
              <Button variant="primary">Xem chỗ trống</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
