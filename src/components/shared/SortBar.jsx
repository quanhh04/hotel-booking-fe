export default function SortBar({ sort, setSort, count }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <h1 className="text-lg font-extrabold text-slate-900">
        Kết quả ({count})
      </h1>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Sắp xếp:</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
        >
          <option value="popular">Phổ biến</option>
          <option value="price_asc">Giá thấp nhất</option>
          <option value="price_desc">Giá cao nhất</option>
          <option value="rating_desc">Điểm đánh giá cao</option>
          <option value="reviews_desc">Nhiều đánh giá</option>
        </select>
      </div>
    </div>
  );
}
