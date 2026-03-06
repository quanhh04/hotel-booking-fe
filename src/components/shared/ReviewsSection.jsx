import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../auth/AuthContext";
import {
    canUserReviewHotel,
    calcReviewStats,
    getReviewsByHotel,
    getUserReview,
    upsertReview,
} from "../services/reviewService";

function fmtTime(iso) {
    try {
        return new Date(iso).toLocaleString("vi-VN");
    } catch {
        return iso || "";
    }
}

function ReviewModal({ open, onClose, defaultRating, defaultComment, onSubmit }) {
    const [rating, setRating] = useState(defaultRating ?? 9);
    const [comment, setComment] = useState(defaultComment ?? "");
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!open) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRating(defaultRating ?? 9);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setComment(defaultComment ?? "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErr("");

        const onKeyDown = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKeyDown);

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prev;
        };
    }, [open, defaultRating, defaultComment, onClose]);

    if (!open) return null;

    function handleSubmit() {
        setErr("");
        const r = Number(rating);

        if (!Number.isFinite(r) || r < 1 || r > 10) return setErr("Điểm đánh giá phải từ 1 đến 10.");
        if (!comment.trim()) return setErr("Vui lòng nhập nội dung đánh giá.");
        onSubmit({ rating: r, comment: comment.trim() });
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
                        <div className="text-sm text-slate-600">Chia sẻ trải nghiệm của bạn (mock).</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                {err && (
                    <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
                        {err}
                    </div>
                )}

                <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600">Điểm (1–10)</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    >
                        {Array.from({ length: 10 }).map((_, i) => {
                            const val = i + 1;
                            return (
                                <option key={val} value={val}>
                                    {val}
                                </option>
                            );
                        })}
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
                    <Button variant="secondary" onClick={onClose}>
                        Huỷ
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Gửi đánh giá
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

    const [tick, setTick] = useState(0);
    const [open, setOpen] = useState(false);

    const reviews = useMemo(() => getReviewsByHotel(hotelId), [hotelId, tick]);
    const stats = useMemo(() => calcReviewStats(reviews), [reviews]);

    const myReview = useMemo(() => {
        if (!user) return null;
        return getUserReview(hotelId, user.id);
    }, [hotelId, user, tick]);

    const canReview = useMemo(() => {
        if (!user) return false;
        return canUserReviewHotel(hotelId, user.id);
    }, [hotelId, user]);

    function onSubmitReview({ rating, comment }) {
        if (!user) return;

        upsertReview({
            hotelId,
            userId: user.id,
            userName: user.name || user.email,
            rating,
            comment,
        });

        setOpen(false);
        setTick((x) => x + 1);
    }

    return (
        <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-extrabold text-slate-900">Đánh giá</h2>
                    <div className="text-sm text-slate-600 mt-1">
                        {stats.count > 0 ? (
                            <>
                                Điểm trung bình: <b>{stats.avg}</b> • {stats.count} đánh giá
                            </>
                        ) : (
                            "Chưa có đánh giá nào."
                        )}
                    </div>
                </div>

                {!user ? (
                    <Link to={`/login?returnTo=${returnTo}`}>
                        <Button variant="primary">Đăng nhập để đánh giá</Button>
                    </Link>
                ) : canReview ? (
                    <Button variant="primary" onClick={() => setOpen(true)}>
                        {myReview ? "Sửa đánh giá" : "Viết đánh giá"}
                    </Button>
                ) : (
                    <div className="text-sm text-slate-600">
                        Bạn cần <b>đặt phòng</b> trước khi đánh giá.
                    </div>
                )}
            </div>

            {/* My review */}
            {user && myReview && (
                <div className="mt-4 rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="font-semibold text-slate-900">Đánh giá của bạn</div>
                            <div className="text-xs text-slate-500 mt-1">
                                Cập nhật: {fmtTime(myReview.updatedAt || myReview.createdAt)}
                            </div>
                        </div>
                        <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
                            {myReview.rating}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                        {myReview.comment}
                    </div>
                </div>
            )}

            {/* List reviews */}
            <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-semibold text-slate-900">{r.userName || "Người dùng"}</div>
                                <div className="text-xs text-slate-500 mt-1">{fmtTime(r.updatedAt || r.createdAt)}</div>
                            </div>
                            <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
                                {r.rating}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                            {r.comment}
                        </div>
                    </div>
                ))}
            </div>

            <ReviewModal
                open={open}
                onClose={() => setOpen(false)}
                defaultRating={myReview?.rating ?? 9}
                defaultComment={myReview?.comment ?? ""}
                onSubmit={onSubmitReview}
            />
        </Card>
    );
}