import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useToast } from "../../contexts/ToastContext";
import { reviewApi } from "../../api/reviewApi";

/**
 * Popup viết / sửa đánh giá cho 1 booking.
 *
 * - Tạo mới: rating mặc định 8, comment rỗng.
 * - Sửa:    pre-fill rating + comment từ review cũ (`existingReview`).
 *
 * Khi gửi thành công → gọi onSuccess() để cha refetch dữ liệu, rồi tự đóng.
 */
export default function ReviewModal({ open, onClose, booking, existingReview, onSuccess }) {
  const [rating, setRating]       = useState(8);
  const [comment, setComment]     = useState("");
  const [err, setErr]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const isEditing = !!existingReview;

  // Reset form mỗi lần modal mở (để không giữ lại dữ liệu cũ giữa các lần mở)
  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating ?? 8);
      setComment(existingReview?.comment ?? "");
      setErr("");
    }
  }, [open, existingReview]);

  if (!open || !booking) return null;

  async function handleSubmit() {
    setErr("");
    const r = Number(rating);
    if (r < 1 || r > 10)              return setErr("Điểm đánh giá phải từ 1 đến 10.");
    if (comment.trim().length < 10)   return setErr("Nội dung đánh giá phải ít nhất 10 ký tự.");

    setSubmitting(true);
    try {
      if (isEditing) {
        await reviewApi.updateReview(existingReview.id, { rating: r, comment: comment.trim() });
        toast.success("Cập nhật đánh giá thành công!");
      } else {
        await reviewApi.createReview({ booking_id: booking.id, rating: r, comment: comment.trim() });
        toast.success("Đánh giá thành công!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      setErr(error.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto max-w-lg rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              {isEditing ? "Sửa đánh giá" : "Viết đánh giá"}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {booking.hotel_name} — {booking.room_name}
            </div>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
            Đóng
          </button>
        </div>

        {err && (
          <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>
        )}

        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-600">Điểm (1–10)</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-600">Nội dung</label>
          <textarea
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
            placeholder="VD: Phòng sạch, nhân viên nhiệt tình..."
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang gửi..." : isEditing ? "Cập nhật" : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </div>
  );
}
