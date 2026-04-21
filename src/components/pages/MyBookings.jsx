import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useBookings } from "../../hooks/useBookings";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { reviewApi } from "../../api/reviewApi";
import { formatVND, formatDate, formatDateTime } from "../../utils/format";
import { BOOKING_STATUS_LABELS } from "../../utils/constants";
import { useToast } from "../../contexts/ToastContext";

function statusBadge(status) {
  const label = BOOKING_STATUS_LABELS[status] || status;
  const isActive = status === "CONFIRMED" || status === "PAID" || status === "PENDING";
  const cls = isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/**
 * Popup viết/sửa đánh giá.
 * - Tạo mới: rating=8, comment rỗng
 * - Sửa: pre-fill rating + comment từ review cũ
 */
function ReviewModal({ open, onClose, booking, existingReview, onSuccess }) {
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const isEditing = !!existingReview;

  // Reset khi mở popup
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
    if (r < 1 || r > 10) return setErr("Điểm đánh giá phải từ 1 đến 10.");
    if (comment.trim().length < 10) return setErr("Nội dung đánh giá phải ít nhất 10 ký tự.");

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

export default function MyBookings() {
  const { bookings, loading, error, refetch } = useBookings();
  const [cancelling, setCancelling] = useState(null);
  const [paying, setPaying] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const toast = useToast();

  // Fetch reviews của user để biết booking nào đã đánh giá
  const [myReviews, setMyReviews] = useState([]);

  function fetchReviews() {
    reviewApi.getMyReviews()
      .then((res) => setMyReviews(Array.isArray(res) ? res : res.reviews || []))
      .catch(() => {});
  }

  useEffect(() => { fetchReviews(); }, []);

  // Tìm review theo booking_id
  function getReviewForBooking(bookingId) {
    return myReviews.find((r) => r.booking_id === bookingId) || null;
  }

  function onReviewSuccess() {
    refetch();
    fetchReviews();
  }

  async function onCancel(id) {
    if (!window.confirm("Bạn chắc chắn muốn huỷ đơn đặt phòng này?")) return;
    setCancelling(id);
    try {
      await bookingApi.cancelBooking(id);
      toast.success("Đã huỷ đơn đặt phòng thành công");
      refetch();
    } catch (err) {
      toast.error(err.message || "Không thể huỷ đơn đặt phòng");
    } finally {
      setCancelling(null);
    }
  }

  async function onPay(id) {
    if (!window.confirm("Xác nhận thanh toán đơn #" + id + "?")) return;
    setPaying(id);
    try {
      await paymentApi.payBooking(id);
      toast.success("Thanh toán thành công!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Thanh toán thất bại");
    } finally {
      setPaying(null);
    }
  }

  if (loading) {
    return <Container className="py-6"><Spinner text="Đang tải lịch sử đặt phòng..." /></Container>;
  }

  if (error) {
    return <Container className="py-6"><ErrorCard message={error} onRetry={refetch} /></Container>;
  }

  // Review hiện tại của booking đang mở popup (nếu có)
  const existingReview = reviewBooking ? getReviewForBooking(reviewBooking.id) : null;

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-slate-900">Lịch sử đặt phòng</h1>
        <Link to="/hotels"><Button variant="primary">Tìm chỗ nghỉ</Button></Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-6 mt-4 text-slate-600">
          Bạn chưa có đơn đặt phòng nào.
          <div className="mt-3">
            <Link to="/hotels"><Button variant="primary">Bắt đầu đặt phòng</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => {
            const review = getReviewForBooking(b.id);
            const canReview = b.status === "PAID" || b.status === "CONFIRMED";

            return (
              <Card key={b.id} className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-slate-900">{b.hotel_name}</div>
                    <div className="text-sm text-slate-600 mt-1">{b.hotel_address}</div>

                    <div className="mt-3 text-sm text-slate-700 space-y-1">
                      <div><b>Phòng:</b> {b.room_name || "-"}</div>
                      <div><b>Ngày:</b> {formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
                      <div><b>Phương thức:</b> {b.payment_method === "online" ? "Thanh toán online" : "Thanh toán tại khách sạn"}</div>
                    </div>

                    {/* Hiển thị đánh giá đã viết */}
                    {review && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">Đánh giá của bạn</span>
                          <span className="rounded-md bg-[#003580] px-2 py-0.5 text-xs font-extrabold text-white">{review.rating}/10</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-700 line-clamp-2">{review.comment}</div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-slate-500">
                      Mã đơn: {b.id} • Tạo lúc: {formatDateTime(b.created_at)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-600">Tổng</div>
                    <div className="text-xl font-extrabold text-slate-900">{formatVND(b.total_price)}</div>

                    <div className="mt-2">{statusBadge(b.status)}</div>

                    <div className="mt-3 flex gap-2 justify-end flex-wrap">
                      {b.hotel_id && (
                        <Link to={`/hotels/${b.hotel_id}`}>
                          <Button variant="secondary">Xem khách sạn</Button>
                        </Link>
                      )}

                      {b.status === "PENDING" && b.payment_method === "online" && (
                        <Button variant="primary" onClick={() => onPay(b.id)} disabled={paying === b.id}>
                          {paying === b.id ? "Đang xử lý..." : "💳 Thanh toán"}
                        </Button>
                      )}

                      {(b.status === "CONFIRMED" || b.status === "PENDING") && (
                        <Button variant="secondary" onClick={() => onCancel(b.id)} disabled={cancelling === b.id}>
                          {cancelling === b.id ? "Đang huỷ..." : "Huỷ đơn"}
                        </Button>
                      )}

                      {canReview && review && (
                        <Button variant="secondary" onClick={() => setReviewBooking(b)}>
                          ✏️ Sửa đánh giá
                        </Button>
                      )}

                      {canReview && !review && (
                        <Button variant="secondary" onClick={() => setReviewBooking(b)}>
                          ⭐ Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ReviewModal
        open={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        booking={reviewBooking}
        existingReview={existingReview}
        onSuccess={onReviewSuccess}
      />
    </Container>
  );
}
