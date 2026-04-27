import { useEffect } from "react";

/**
 * Modal full-screen hiển thị toàn bộ ảnh khách sạn.
 *
 * Hành vi:
 *   - Mở: khoá scroll body, lắng nghe phím Esc để đóng
 *   - Click vào nền tối (không phải ảnh) → đóng
 *   - Khi unmount: gỡ listener + trả lại scroll
 */
export default function HotelGalleryModal({ open, onClose, images, title }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);

    // Khoá scroll body — nhớ lưu giá trị cũ để khôi phục khi đóng
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 p-4 overflow-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between text-white mb-3">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
            Đóng (Esc)
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map((src, i) => (
            <img
              key={typeof src === "string" ? src : src.url || i}
              src={typeof src === "string" ? src : src.url}
              alt={title}
              className="h-56 w-full rounded-md object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
