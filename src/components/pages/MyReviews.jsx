import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { reviewApi } from "../../api/reviewApi";
import { formatDateTime } from "../../utils/format";
import { useToast } from "../../contexts/ToastContext";

export default function MyReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await reviewApi.getMyReviews(); setReviews(Array.isArray(res) ? res : res.reviews || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function onDelete(id) {
    if (!window.confirm("Xoá đánh giá này?")) return;
    try { await reviewApi.deleteReview(id); toast.success("Đã xoá"); fetch(); }
    catch (err) { toast.error(err.message); }
  }

  if (loading) return <Container className="py-6"><Spinner text="Đang tải đánh giá..." /></Container>;
  if (error) return <Container className="py-6"><ErrorCard message={error} onRetry={fetch} /></Container>;

  return (
    <Container className="py-6">
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Đánh giá của tôi</h1>
      {reviews.length === 0 ? (
        <Card className="p-6 text-slate-600">
          Bạn chưa viết đánh giá nào.
          <div className="mt-3"><Link to="/hotels"><Button variant="primary">Tìm khách sạn</Button></Link></div>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/hotels/${r.hotel_id}`} className="font-semibold text-[#0071c2] hover:underline">{r.hotel_name || `Hotel #${r.hotel_id}`}</Link>
                  <div className="text-xs text-slate-500 mt-1">{formatDateTime(r.updated_at || r.created_at)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-bold text-white">{r.rating}</span>
                  <button onClick={() => onDelete(r.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{r.comment}</div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
