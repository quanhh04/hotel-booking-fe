import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#0071c2]"
      />
      <span>{label}</span>
    </label>
  );
}

export default function FiltersSidebar({
  filters,
  setFilters,
  options,
  onApply,
  onReset,
}) {
  const { starOptions, ratingOptions, amenityOptions, propertyTypeOptions } = options;

  function toggleInArray(key, value) {
    setFilters((prev) => {
      const arr = new Set(prev[key] || []);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...prev, [key]: Array.from(arr) };
    });
  }

  return (
    <Card className="p-4 border-2 border-[#febb02]">
      <h2 className="font-extrabold text-slate-900">Tìm</h2>

      {/* Destination */}
      <div className="mt-3">
        <label className="text-xs font-semibold text-slate-600">Thành phố</label>
        <Input
          value={filters.city}
          onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
          className="mt-1"
          placeholder="VD: Đà Nẵng"
        />
      </div>

      {/* Price */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600">Ngân sách (mỗi đêm)</label>
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, minPrice: "", maxPrice: "" }))}
            className="text-xs text-[#0071c2] hover:underline"
          >
            Xoá
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-slate-500">Từ</label>
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
              className="mt-1"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Đến</label>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
              className="mt-1"
              placeholder="5000000"
            />
          </div>
        </div>

        {/* quick presets (giống Booking vibe) */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="text-xs rounded-md border px-2 py-1 hover:bg-slate-50"
            onClick={() => setFilters((p) => ({ ...p, minPrice: "", maxPrice: "1000000" }))}
          >
            ≤ 1.000.000
          </button>
          <button
            type="button"
            className="text-xs rounded-md border px-2 py-1 hover:bg-slate-50"
            onClick={() => setFilters((p) => ({ ...p, minPrice: "1000000", maxPrice: "2000000" }))}
          >
            1–2 triệu
          </button>
          <button
            type="button"
            className="text-xs rounded-md border px-2 py-1 hover:bg-slate-50"
            onClick={() => setFilters((p) => ({ ...p, minPrice: "2000000", maxPrice: "" }))}
          >
            ≥ 2.000.000
          </button>
        </div>
      </div>

      {/* Stars */}
      <div className="mt-5">
        <div className="text-sm font-extrabold text-slate-900">Xếp hạng sao</div>
        <div className="mt-2 space-y-1">
          {starOptions.map((s) => (
            <Checkbox
              key={s}
              checked={(filters.stars || []).includes(String(s))}
              onChange={() => toggleInArray("stars", String(s))}
              label={`${s} sao`}
            />
          ))}
        </div>
      </div>

      {/* Review score */}
      <div className="mt-5">
        <div className="text-sm font-extrabold text-slate-900">Điểm đánh giá</div>
        <div className="mt-2 space-y-1">
          {ratingOptions.map((r) => (
            <label key={r.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                value={r.value}
                checked={String(filters.minRating) === String(r.value)}
                onChange={(e) => setFilters((p) => ({ ...p, minRating: e.target.value }))}
                className="h-4 w-4 accent-[#0071c2]"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div className="mt-5">
        <div className="text-sm font-extrabold text-slate-900">Loại chỗ ở</div>
        <div className="mt-2 space-y-1">
          {propertyTypeOptions.map((t) => (
            <Checkbox
              key={t}
              checked={(filters.propertyTypes || []).includes(t)}
              onChange={() => toggleInArray("propertyTypes", t)}
              label={t}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-5">
        <div className="text-sm font-extrabold text-slate-900">Tiện ích</div>
        <div className="mt-2 space-y-1">
          {amenityOptions.map((a) => (
            <Checkbox
              key={a}
              checked={(filters.amenities || []).includes(a)}
              onChange={() => toggleInArray("amenities", a)}
              label={a}
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-2">
          * Lọc theo kiểu “có đủ tiện ích đã chọn”.
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2">
        <Button variant="primary" className="w-full" onClick={onApply}>
          Áp dụng
        </Button>
        <Button variant="secondary" className="w-full" onClick={onReset}>
          Đặt lại
        </Button>
      </div>
    </Card>
  );
}
