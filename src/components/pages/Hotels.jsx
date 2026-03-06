import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { hotels } from "../data/hotels";

import FiltersSidebar from "../shared/FiltersSidebar";
import HotelCard from "../shared/HotelCard";
import SortBar from "../shared/SortBar";

export default function Hotels() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  // ✅ deal=1 => chỉ hiển thị ưu đãi
  const dealOnly = sp.get("deal") === "1";

  // ✅ init city từ query (để Home search sang Hotels có tác dụng)
  const initialCity = sp.get("city") || "";

  // ✅ gom filter vào 1 object (để sidebar xịn hơn)
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

  const filtered = useMemo(() => {
    const city = filters.city?.trim() || "";
    const q = city.toLowerCase();

    const minP = filters.minPrice ? Number(filters.minPrice) : null;
    const maxP = filters.maxPrice ? Number(filters.maxPrice) : null;
    const minRating = Number(filters.minRating || 0);

    const starSet = new Set((filters.stars || []).map(String));
    const amenSet = new Set(filters.amenities || []);
    const typeSet = new Set(filters.propertyTypes || []);

    let list = hotels
      // ✅ city match 2 chiều: "Hồ Chí Minh" <-> "TP. Hồ Chí Minh"
      .filter((h) => {
        if (!q) return true;
        const hc = String(h.city || "").toLowerCase();
        return hc.includes(q) || q.includes(hc);
      })
      .filter((h) => (minP != null ? h.priceFrom >= minP : true))
      .filter((h) => (maxP != null ? h.priceFrom <= maxP : true))
      .filter((h) => h.rating >= minRating)
      .filter((h) => (starSet.size ? starSet.has(String(h.stars)) : true))
      .filter((h) => (typeSet.size ? typeSet.has(h.propertyType || "Khách sạn") : true))
      .filter((h) => {
        if (!amenSet.size) return true;
        const hotelA = new Set(h.amenities || []);
        for (const a of amenSet) if (!hotelA.has(a)) return false;
        return true;
      })
      // ✅ ưu đãi
      .filter((h) => (dealOnly ? Number(h.discountPercent || 0) > 0 : true));

    // ✅ sort giống Booking
    switch (sort) {
      case "price_asc":
        list = list.slice().sort((a, b) => a.priceFrom - b.priceFrom);
        break;
      case "price_desc":
        list = list.slice().sort((a, b) => b.priceFrom - a.priceFrom);
        break;
      case "rating_desc":
        list = list.slice().sort((a, b) => b.rating - a.rating);
        break;
      case "reviews_desc":
        list = list.slice().sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      default:
        break;
    }

    return list;
  }, [filters, sort, dealOnly]);

  // ✅ options cho sidebar (giống Booking)
  const options = useMemo(() => {
    const starOptions = [2, 3, 4, 5];

    const ratingOptions = [
      { value: "0", label: "Tất cả" },
      { value: "8", label: "8+ (Tốt)" },
      { value: "8.5", label: "8.5+ (Rất tốt)" },
      { value: "9", label: "9+ (Tuyệt hảo)" },
    ];

    const allAmenities = hotels.flatMap((h) => h.amenities || []);
    const freq = new Map();
    for (const a of allAmenities) freq.set(a, (freq.get(a) || 0) + 1);

    const amenityOptions = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);

    const propertyTypeOptions = Array.from(
      new Set(hotels.map((h) => h.propertyType || "Khách sạn"))
    );

    return { starOptions, ratingOptions, amenityOptions, propertyTypeOptions };
  }, []);

  function onApply() {}

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
    // xoá deal=1 nhưng giữ các param khác nếu có
    const next = new URLSearchParams(sp);
    next.delete("deal");
    navigate(`/hotels${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <Container className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ✅ Sidebar */}
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

        {/* ✅ List */}
        <div className="lg:col-span-8">
          {dealOnly && (
            <Card className="p-4 mb-3 border border-[#febb02] bg-[#fff8e1]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900">Ưu đãi hôm nay</div>
                  <div className="text-sm text-slate-600">
                    Chỉ hiển thị khách sạn có giảm giá (mock).
                  </div>
                </div>
                <Button variant="secondary" onClick={goAllHotels}>
                  Xem tất cả
                </Button>
              </div>
            </Card>
          )}

          <SortBar sort={sort} setSort={setSort} count={filtered.length} />

          <div className="space-y-3">
            {filtered.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}

            {filtered.length === 0 && (
              <Card className="p-6 text-center text-slate-600">
                Không có kết quả phù hợp. Thử đổi bộ lọc nhé.
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
