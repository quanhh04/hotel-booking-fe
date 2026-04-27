/**
 * Lưới ảnh khách sạn ở đầu trang detail:
 *   - 1 ảnh lớn bên trái (mainImg)
 *   - 4 ảnh nhỏ bên phải (slot 2-5)
 *   - Nếu không đủ ảnh thì lấp ô xám
 *   - Bấm nút "Xem tất cả ảnh" → mở modal (do component cha xử lý)
 */
export default function HotelGallery({ images, hotelName, onOpenGallery }) {
  const gallery = images.slice(0, 5);
  const mainImg = images[0];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-extrabold text-slate-900">Ảnh</div>
        {images.length > 0 && (
          <button
            className="text-sm font-semibold text-[#0071c2] hover:underline"
            onClick={onOpenGallery}
          >
            Xem tất cả ảnh
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-6">
          {mainImg ? (
            <img src={mainImg} alt={hotelName} className="h-72 w-full rounded-md object-cover" loading="lazy" />
          ) : (
            <div className="h-72 w-full rounded-md bg-slate-200" />
          )}
        </div>
        <div className="md:col-span-6 grid grid-cols-2 gap-2">
          {gallery.slice(1, 5).map((src, i) => (
            <img key={src || i} src={src} alt={hotelName} className="h-36 w-full rounded-md object-cover" loading="lazy" />
          ))}
          {/* Lấp đầy chỗ trống bằng ô xám nếu chưa đủ 5 ảnh */}
          {gallery.length < 5 &&
            Array.from({ length: Math.max(0, 5 - gallery.length) }).map((_, i) => (
              <div key={i} className="h-36 rounded-md bg-slate-200" />
            ))}
        </div>
      </div>
    </div>
  );
}
