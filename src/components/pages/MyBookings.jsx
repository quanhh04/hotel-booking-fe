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
import { useToast } from "../../contexts/ToastContext";

import BookingHistoryCard from "../my-bookings/BookingHistoryCard";
import ReviewModal from "../my-bookings/ReviewModal";

/**
 * Trang lịch sử đặt phòng của user.
 *
 * Component này quản lý:
 *   - Danh sách bookings  (qua hook useBookings)
 *   - Danh sách reviews user đã viết (để biết booking nào "đã đánh giá")
 *   - State đang thanh toán / đang huỷ / đang mở popup đánh giá
 *
 * Các thao tác (cancel/pay/review) đều chỉ refetch dữ liệu, KHÔNG tự update local
 * → đảm bảo dữ liệu luôn khớp với BE.
 */
export default function MyBookings() {
  const { bookings, loading, error, refetch } = useBookings();
  const toast = useToast();

  // State cho từng action — lưu booking-id đang xử lý để hiện text "Đang xử lý..."
  const [cancelling, setCancelling]       = useState(null);
  const [paying, setPaying]               = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  // Lấy review của user để biết booking nào đã đánh giá rồi
  const [myReviews, setMyReviews] = useState([]);

  function fetchReviews() {
    reviewApi.getMyReviews()
      .then((res) => setMyReviews(Array.isArray(res) ? res : res.reviews || []))
      .catch(() => { /* lỗi không quan trọng — bỏ qua */ });
  }

  useEffect(() => { fetchReviews(); }, []);

  function getReviewForBooking(bookingId) {
    return myReviews.find((r) => r.booking_id === bookingId) || null;
  }

  // Sau khi gửi/sửa review thành công → refetch cả 2 danh sách
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

  // Review của booking đang mở popup (để pre-fill khi sửa)
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
          {bookings.map((b) => (
            <BookingHistoryCard
              key={b.id}
              booking={b}
              review={getReviewForBooking(b.id)}
              paying={paying}
              cancelling={cancelling}
              onPay={onPay}
              onCancel={onCancel}
              onReview={setReviewBooking}
            />
          ))}
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
