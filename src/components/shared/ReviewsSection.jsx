import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useReviews } from "../../hooks/useReviews";
import { reviewApi } from "../../api/reviewApi";
import { bookingApi } from "../../api/bookingApi";

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function ReviewModal({ open, onClose, defaultRating, defaultComment, onSubmit, submitting, bookingId, isEditing }) {
  const [rating, setRating] = useState(defaultRating ?? 8);
  const [comment, setComment] = useState(defaultComment ?? "");
  const [err, setErr] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setRating(defaultRating ?? 8);
      setComment(defaultComment ?? "");
      setErr("");
    }
  }, [open, defaultRating, defaultComment]);

  if (!open) return null;

  function handleSubmit() {
    setErr("");
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 10) return setErr("Điểm đánh giá phải từ 1 đến 10.");
    if (comment.trim().length < 10) return setErr("Nội dung đánh giá phải ít nhất 10 ký tự.");
    onSubmit({ rating: r, comment: comment.trim(), bookingId });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto max-w-lg rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold text-slate-900">Viết đánh giá</div>
            <div className="text-sm text-slate-600">Chia sẻ trải nghiệm của bạn.</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
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
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection({ hotelId }) {
  const { user } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

  const { reviews, total, loading, error, refetch } = useReviews(hotelId);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userBookingId, setUserBookingId] = useState(null);
  const toast = useToast();

  // Fetch user's booking for this hotel to get booking_id for review
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    bookingApi.getMyBookings().then(bookings => {
      if (cancelled) return;
      const list = Array.isArray(bookings) ? bookings : bookings.bookings || [];
      const match = list.find(b =>
        String(b.hotel_id) === String(hotelId) && ["PAID", "CONFIRMED"].includes(b.status)
      );
      if (match) setUserBookingId(match.id);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hotelId]);

  const stats = useMemo(() => {
    const count = reviews.length;
    if (!count) return { count: 0, avg: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const avg = Math.round((sum / count) * 10) / 10;
    return { count, avg };
  }, [reviews]);

  // Find current user's review
  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => String(r.user_id) === String(user.id));
  }, [reviews, user]);

  async function onSubmitReview({ rating, comment, bookingId }) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (myReview) {
        await reviewApi.updateReview(myReview.id, { rating, comment });
      } else {
        if (!bookingId) {
          toast.error("Bạn cần có booking đã thanh toán để đánh giá");
          setSubmitting(false);
          return;
        }
        await reviewApi.createReview({ booking_id: bookingId, rating, comment });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Card className="p-4"><Spinner text="Đang tải đánh giá..." /></Card>;
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900">Đánh giá</h2>
          <div className="text-sm text-slate-600 mt-1">
            {stats.count > 0 ? (
              <>Điểm trung bình: <b>{stats.avg}</b> • {stats.count} đánh giá</>
            ) : (
              "Chưa có đánh giá nào."
            )}
          </div>
        </div>

        {!user ? (
          <Link to={`/login?returnTo=${returnTo}`}>
            <Button variant="primary">Đăng nhập để đánh giá</Button>
          </Link>
        ) : myReview ? (
          <Button variant="primary" onClick={() => setOpen(true)}>Sửa đánh giá</Button>
        ) : userBookingId ? (
          <Button variant="primary" onClick={() => setOpen(true)}>Viết đánh giá</Button>
        ) : (
          <div className="text-xs text-slate-500">Cần có booking để đánh giá</div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      {/* My review */}
      {user && myReview && (
        <div className="mt-4 rounded-lg border border-slate-200 p-3 bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">Đánh giá của bạn</div>
              <div className="text-xs text-slate-500 mt-1">
                Cập nhật: {fmtTime(myReview.updated_at || myReview.created_at)}
              </div>
            </div>
            <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
              {myReview.rating}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{myReview.comment}</div>
        </div>
      )}

      {/* List reviews */}
      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{r.display_name || r.user_name || "Người dùng"}</div>
                <div className="text-xs text-slate-500 mt-1">{fmtTime(r.updated_at || r.created_at)}</div>
              </div>
              <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
                {r.rating}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{r.comment}</div>
          </div>
        ))}
      </div>

      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        defaultRating={myReview?.rating ?? 8}
        defaultComment={myReview?.comment ?? ""}
        onSubmit={onSubmitReview}
        submitting={submitting}
        bookingId={userBookingId}
        isEditing={!!myReview}
      />
    </Card>
  );
}
