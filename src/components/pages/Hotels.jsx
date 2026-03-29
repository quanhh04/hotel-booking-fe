import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import FiltersSidebar from "../shared/FiltersSidebar";
import HotelCard from "../shared/HotelCard";
import SortBar from "../shared/SortBar";
import { useHotels } from "../../hooks/useHotels";

const SORT_MAP = {
  popular: {},
  price_asc: { sort_by: "price", sort_order: "ASC" },
  price_desc: { sort_by: "price", sort_order: "DESC" },
  rating_desc: { sort_by: "rating", sort_order: "DESC" },
  reviews_desc: { sort_by: "reviews", sort_order: "DESC" },
};

export default function Hotels() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const dealOnly = sp.get("deal") === "1";
  const initialCity = sp.get("city") || "";

  const [filters, setFilters] = useState({
    city: initialCity,
    minPrice: "",
    maxPrice: "",
    stars: [],
    minRating: "0",
    amenities: [],
    propertyTypes: [],
  });

  const [sort, setSort] = useState("popular");

  // Build API params from filters + sort
  const apiParams = useMemo(() => {
    const params = {};
    if (filters.city?.trim()) params.keyword = filters.city.trim();
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    if (filters.stars?.length) params.stars = filters.stars.join(",");

    const sortConfig = SORT_MAP[sort] || {};
    if (sortConfig.sort_by) params.sort_by = sortConfig.sort_by;
    if (sortConfig.sort_order) params.sort_order = sortConfig.sort_order;

    params.limit = 50;
    return params;
  }, [filters.city, filters.minPrice, filters.maxPrice, filters.stars, sort]);

  const { hotels, total, loading, error, refetch } = useHotels(apiParams);

  // Sidebar options (hardcoded since we no longer have mock data to derive from)
  const options = useMemo(() => ({
    starOptions: [2, 3, 4, 5],
    ratingOptions: [
      { value: "0", label: "Tất cả" },
      { value: "8", label: "8+ (Tốt)" },
      { value: "8.5", label: "8.5+ (Rất tốt)" },
      { value: "9", label: "9+ (Tuyệt hảo)" },
    ],
    amenityOptions: ["WiFi miễn phí", "Hồ bơi", "Bãi đậu xe", "Nhà hàng", "Phòng gym", "Spa", "Điều hoà", "Lễ tân 24/7"],
    propertyTypeOptions: ["Khách sạn", "Resort", "Nhà nghỉ", "Căn hộ"],
  }), []);

  function onApply() {
    // Filters are already reactive via apiParams
  }

  function onReset() {
    setFilters({
      city: "",
      minPrice: "",
      maxPrice: "",
      stars: [],
      minRating: "0",
      amenities: [],
      propertyTypes: [],
    });
    setSort("popular");
  }

  function goAllHotels() {
    const next = new URLSearchParams(sp);
    next.delete("deal");
    navigate(`/hotels${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <Container className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-4">
            <FiltersSidebar
              filters={filters}
              setFilters={setFilters}
              options={options}
              onApply={onApply}
              onReset={onReset}
            />
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-8">
          {dealOnly && (
            <Card className="p-4 mb-3 border border-[#febb02] bg-[#fff8e1]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900">Ưu đãi hôm nay</div>
                  <div className="text-sm text-slate-600">Chỉ hiển thị khách sạn có giảm giá.</div>
                </div>
                <Button variant="secondary" onClick={goAllHotels}>Xem tất cả</Button>
              </div>
            </Card>
          )}

          <SortBar sort={sort} setSort={setSort} count={total || hotels.length} />

          {loading ? (
            <Spinner text="Đang tải danh sách khách sạn..." />
          ) : error ? (
            <ErrorCard message={error} onRetry={refetch} />
          ) : (
            <div className="space-y-3">
              {hotels.map((h) => (
                <HotelCard key={h.id} hotel={h} />
              ))}

              {hotels.length === 0 && (
                <Card className="p-6 text-center text-slate-600">
                  Không có kết quả phù hợp. Thử đổi bộ lọc nhé.
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
