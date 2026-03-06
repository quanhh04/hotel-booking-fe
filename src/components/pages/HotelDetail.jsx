import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { hotels, formatVND } from "../data/hotels";
import { useAuth } from "../auth/AuthContext";
import ReviewsSection from "../shared/ReviewsSection";

function getLabelByRating(rating) {
  if (rating >= 9) return "Tuyệt hảo";
  if (rating >= 8.5) return "Rất tốt";
  if (rating >= 8) return "Tốt";
  return "Ổn";
}

function calcDiscountPrice(price, discountPercent) {
  const p = Number(price || 0);
  const d = Number(discountPercent || 0);
  if (!d || d <= 0) return { hasDeal: false, original: p, final: p, discount: 0, saved: 0 };
  const final = Math.max(0, Math.round(p * (1 - d / 100)));
  return { hasDeal: true, original: p, final, discount: d, saved: Math.max(0, p - final) };
}

function buildMockRooms(hotel) {
  const base = Number(hotel.priceFrom || 900000);
  return [
    { id: "r1", type: "Phòng Tiêu Chuẩn", bed: "1 giường đôi", size: "22 m²", refundable: true, breakfast: false, left: 3, price: base },
    { id: "r2", type: "Phòng Superior", bed: "2 giường đơn", size: "28 m²", refundable: true, breakfast: true, left: 2, price: Math.round(base * 1.25) },
    { id: "r3", type: "Phòng Deluxe View", bed: "1 giường đôi lớn", size: "32 m²", refundable: false, breakfast: true, left: 1, price: Math.round(base * 1.5) },
  ];
}

function GalleryModal({ open, onClose, images, title }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
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
          {images.map((src) => (
            <img key={src} src={src} alt={title} className="h-56 w-full rounded-md object-cover" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HotelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const hotel = useMemo(() => hotels.find((h) => String(h.id) === String(id)), [id]);

  // ✅ an toàn dù hotel = null
  const discountPercent = Number(hotel?.discountPercent || 0);

  const roomsRaw = useMemo(() => {
    if (!hotel) return [];
    return hotel.rooms?.length ? hotel.rooms : buildMockRooms(hotel);
  }, [hotel]);

  const rooms = useMemo(() => {
    if (!hotel) return [];
    return roomsRaw.map((r) => ({
      ...r,
      deal: calcDiscountPrice(r.price || hotel.priceFrom, discountPercent),
    }));
  }, [roomsRaw, hotel, discountPercent]);

  // ✅ giờ mới return sớm
  if (!hotel) {
    return (
      <Container className="py-10">
        <Card className="p-6">Không tìm thấy khách sạn.</Card>
      </Container>
    );
  }

  const ratingLabel = getLabelByRating(Number(hotel.rating || 0));

  const description = hotel.description || "Chỗ nghỉ này có vị trí thuận tiện, phù hợp đi công tác hoặc du lịch. (Mock)";
  const amenities = hotel.amenities?.length ? hotel.amenities : ["WiFi miễn phí", "Lễ tân 24/7", "Điều hoà", "Chỗ đậu xe", "Nhà hàng"];

  // ✅ “Giá từ” phải lấy theo giá sau giảm (min)
  const minFinal = Math.min(...rooms.map((x) => x.deal.final));
  const minOriginal = Math.min(...rooms.map((x) => x.deal.original));
  const hasDeal = discountPercent > 0;

  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");
  const guests = sp.get("guests");

  const bookingUrl = (roomId) =>
    `/booking/${hotel.id}${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;

  const loginToBookUrl = (roomId) =>
    `/login?returnTo=${encodeURIComponent(bookingUrl(roomId))}`;

  function scrollToRooms() {
    const el = document.getElementById("rooms");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const gallery = hotel.images?.slice(0, 5) || [];
  const mainImg = hotel.images?.[0];

  return (
    <div className="bg-slate-50">
      <Container className="py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-600">
          <Link className="text-[#0071c2] hover:underline" to="/">Trang chủ</Link> /{" "}
          <Link className="text-[#0071c2] hover:underline" to="/hotels">Khách sạn</Link> /{" "}
          <span className="text-slate-700 font-semibold">{hotel.name}</span>
        </div>

        {/* Header */}
        <div className="mt-3 flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{hotel.name}</h1>
            <div className="mt-1 text-sm text-slate-600">
              {hotel.address} • {hotel.city} • <span className="font-semibold">{hotel.stars} sao</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {(hotel.tags || []).slice(0, 6).map((t) => (
                <span key={t} className="text-xs rounded-full bg-white px-2 py-1 text-slate-700 border border-slate-200">
                  {t}
                </span>
              ))}
            </div>

            {hasDeal && (
              <div className="mt-2 inline-flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#008234] px-2 py-1 text-xs font-extrabold text-white">
                  Giảm {discountPercent}%
                </span>
                <span className="text-xs text-slate-600">Ưu đãi trong thời gian có hạn (mock)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-700">{ratingLabel}</div>
              <div className="text-xs text-slate-500">{hotel.reviews || 0} đánh giá</div>
            </div>
            <div className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">{hotel.rating}</div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Hoàn huỷ miễn phí (tuỳ phòng)</div>
            <div className="text-xs text-slate-600 mt-1">Xem điều kiện hoàn huỷ trong bảng phòng.</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Không cần thẻ tín dụng (mock)</div>
            <div className="text-xs text-slate-600 mt-1">Demo đồ án: thanh toán sẽ làm ở Phần 5.</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Giá tốt hôm nay</div>
            {/* ✅ đổi sang giá sau giảm */}
            <div className="text-xs text-slate-600 mt-1">
              Giá từ <b>{formatVND(minFinal)}</b>/đêm.
              {hasDeal && (
                <span className="ml-2 text-slate-500 line-through">{formatVND(minOriginal)}</span>
              )}
            </div>
          </Card>
        </div>

        {/* Gallery */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-extrabold text-slate-900">Ảnh</div>
            <button className="text-sm font-semibold text-[#0071c2] hover:underline" onClick={() => setGalleryOpen(true)}>
              Xem tất cả ảnh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              {mainImg ? (
                <img src={mainImg} alt={hotel.name} className="h-72 w-full rounded-md object-cover" loading="lazy" />
              ) : (
                <div className="h-72 w-full rounded-md bg-slate-200" />
              )}
            </div>
            <div className="md:col-span-6 grid grid-cols-2 gap-2">
              {gallery.slice(1, 5).map((src) => (
                <img key={src} src={src} alt={hotel.name} className="h-36 w-full rounded-md object-cover" loading="lazy" />
              ))}
              {gallery.length < 5 &&
                Array.from({ length: 5 - gallery.length }).map((_, i) => (
                  <div key={i} className="h-36 rounded-md bg-slate-200" />
                ))}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-slate-900">Tổng quan</h2>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{description}</p>
                </div>

                <div className="hidden sm:block">
                  <Button variant="primary" onClick={scrollToRooms}>
                    Xem chỗ trống
                  </Button>
                </div>
              </div>

              <h3 className="mt-4 font-extrabold text-slate-900">Tiện ích</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {a}
                  </span>
                ))}
              </div>

              {(checkIn || checkOut || guests) && (
                <div className="mt-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Thông tin tìm kiếm:</span>{" "}
                  {checkIn ? `Nhận phòng: ${checkIn}` : ""}{" "}
                  {checkOut ? `• Trả phòng: ${checkOut}` : ""}{" "}
                  {guests ? `• Khách: ${guests}` : ""}
                </div>
              )}
            </Card>

            {/* Rooms */}
            <Card className="p-4" id="rooms">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-extrabold text-slate-900">Chọn phòng</h2>
                <div className="text-xs text-slate-600">Giá hiển thị: /đêm (mock)</div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 border-b">
                      <th className="py-2">Loại phòng</th>
                      <th className="py-2">Chi tiết</th>
                      <th className="py-2">Chính sách</th>
                      <th className="py-2 text-right">Giá</th>
                      <th className="py-2 text-right">Đặt</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {rooms.map((r) => (
                      <tr key={r.id} className="align-top">
                        <td className="py-3 font-semibold text-slate-900">
                          {r.type}
                          {typeof r.left === "number" && r.left <= 2 && (
                            <div className="text-xs text-red-700 font-semibold mt-1">
                              Chỉ còn {r.left} phòng!
                            </div>
                          )}
                        </td>

                        <td className="py-3 text-slate-700">
                          <div>{r.bed}</div>
                          <div className="text-xs text-slate-500">{r.size}</div>
                          {r.breakfast && (
                            <div className="mt-1 text-xs text-green-700 font-semibold">
                              Bao gồm bữa sáng
                            </div>
                          )}
                        </td>

                        <td className="py-3 text-slate-700">
                          {r.refundable ? (
                            <>
                              <div className="text-green-700 font-semibold">Có hoàn huỷ</div>
                              <div className="text-xs text-slate-500">(mock) Hoàn huỷ trước 24h</div>
                            </>
                          ) : (
                            <>
                              <div className="text-red-700 font-semibold">Không hoàn huỷ</div>
                              <div className="text-xs text-slate-500">(mock) Không hoàn tiền</div>
                            </>
                          )}
                        </td>

                        {/* ✅ GIÁ: hiển thị giá sau giảm + gạch giá gốc */}
                        <td className="py-3 text-right">
                          {r.deal.hasDeal ? (
                            <>
                              <div className="text-xs text-slate-500 line-through">
                                {formatVND(r.deal.original)}
                              </div>
                              <div className="font-extrabold text-slate-900">
                                {formatVND(r.deal.final)}
                              </div>
                              <div className="text-xs text-[#008234] font-semibold">
                                Giảm {r.deal.discount}% (mock)
                              </div>
                            </>
                          ) : (
                            <div className="font-extrabold text-slate-900">
                              {formatVND(r.deal.final)}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">Đã gồm thuế/phí (mock)</div>
                        </td>

                        <td className="py-3 text-right">
                          {user ? (
                            <Link to={bookingUrl(r.id)}>
                              <Button variant="primary">Đặt</Button>
                            </Link>
                          ) : (
                            <Link to={loginToBookUrl(r.id)}>
                              <Button variant="primary">Đăng nhập để đặt</Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-3">
              <Card className="p-4 border-2 border-[#febb02]">
                <div className="text-sm text-slate-600">Giá từ</div>

                {/* ✅ BOX GIÁ: ưu đãi + gạch giá gốc */}
                {hasDeal ? (
                  <>
                    <div className="mt-1 text-xs text-slate-500 line-through">
                      {formatVND(minOriginal)}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {formatVND(minFinal)}
                    </div>
                    <div className="text-xs text-[#008234] font-semibold mt-1">
                      Giảm {discountPercent}% (mock)
                    </div>
                  </>
                ) : (
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    {formatVND(minFinal)}
                  </div>
                )}

                <div className="text-xs text-slate-500 mt-1">/đêm (mock)</div>

                <div className="mt-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Đánh giá</span>
                    <span className="font-semibold">{ratingLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Điểm</span>
                    <span className="font-semibold">{hotel.rating}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="primary" className="w-full" onClick={scrollToRooms}>
                    {user ? "Chọn phòng để đặt" : "Xem phòng"}
                  </Button>
                </div>

                {!user && (
                  <div className="mt-3 text-xs text-slate-600">
                    * Bạn vẫn xem được phòng, nhưng cần đăng nhập để đặt.
                  </div>
                )}
              </Card>
              <ReviewsSection hotelId={hotel.id} />
              <Link to="/hotels">
                <Button variant="secondary" className="w-full">
                  Quay lại danh sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <GalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={hotel.images || []}
        title={hotel.name}
      />
    </div>
  );
}
