import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../data/hotels";

export default function HotelCard({ hotel }) {
  const discount = Number(hotel.discountPercent || 0);
  const hasDeal = discount > 0;

  const priceOriginal = Number(hotel.priceFrom || 0);
  const priceFinal = hasDeal
    ? Math.max(0, Math.round(priceOriginal * (1 - discount / 100)))
    : priceOriginal;

  const img = hotel.images?.[0];

  return (
    <Card className="p-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Image */}
        <div className="sm:col-span-4">
          <div className="relative">
            {img ? (
              <img
                src={img}
                alt={hotel.name}
                className="h-44 w-full rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full rounded-md bg-slate-200" />
            )}

            {hasDeal && (
              <div className="absolute left-2 top-2">
                <span className="inline-flex items-center rounded-md bg-[#008234] px-2 py-1 text-xs font-extrabold text-white shadow">
                  Giảm {discount}%
                </span>
              </div>
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
                {hotel.city}
                {hotel.address ? ` • ${hotel.address}` : ""}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(hotel.tags || []).slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {hasDeal && (
                <div className="mt-2 text-xs text-[#008234] font-semibold">
                  Ưu đãi trong thời gian có hạn (mock)
                </div>
              )}
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
              {hasDeal ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 line-through">
                      {formatVND(priceOriginal)}
                    </span>
                    <span className="text-xs rounded-full bg-[#febb02] px-2 py-0.5 font-bold text-[#003580]">
                      Member deal
                    </span>
                  </div>

                  <div className="mt-1">
                    Giá ưu đãi{" "}
                    <span className="font-extrabold text-slate-900">
                      {formatVND(priceFinal)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  Giá từ{" "}
                  <span className="font-extrabold text-slate-900">
                    {formatVND(priceOriginal)}
                  </span>
                </>
              )}

              <div className="text-xs text-slate-500">Đã gồm thuế/phí (mock)</div>
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
