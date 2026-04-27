import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useAuth } from "../../contexts/AuthContext";
import { useHotelDetail } from "../../hooks/useHotelDetail";
import ReviewsSection from "../shared/ReviewsSection";

import HotelGallery from "../hotel/HotelGallery";
import HotelGalleryModal from "../hotel/HotelGalleryModal";
import HotelOverview from "../hotel/HotelOverview";
import HotelRoomsTable from "../hotel/HotelRoomsTable";
import HotelPriceSidebar from "../hotel/HotelPriceSidebar";
import { formatVND } from "../../utils/format";

/**
 * Trang chi tiết khách sạn.
 *
 * Bố cục:
 *   - Header: tên, địa chỉ, sao, rating
 *   - 3 highlight nhỏ
 *   - Gallery (5 ảnh) + modal xem tất cả
 *   - LEFT: Tổng quan + Bảng phòng
 *   - RIGHT: Sidebar giá + Reviews
 */

// Quy ước nhãn theo điểm rating của Booking
function getLabelByRating(rating) {
  if (rating >= 9)   return "Tuyệt hảo";
  if (rating >= 8.5) return "Rất tốt";
  if (rating >= 8)   return "Tốt";
  return "Ổn";
}

export default function HotelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { hotel, rooms, loading, error } = useHotelDetail(id);

  // BE có thể trả mảng string hoặc mảng object {id, url} → chuẩn hoá thành mảng URL.
  // Phải gọi useMemo TRƯỚC mọi early return để tuân thủ Rules of Hooks.
  const imageList = useMemo(() => {
    if (!hotel?.images?.length) return [];
    return hotel.images.map((img) => (typeof img === "string" ? img : img.url));
  }, [hotel?.images]);

  if (loading) {
    return <Container className="py-10"><Spinner text="Đang tải thông tin khách sạn..." /></Container>;
  }
  if (error) {
    return (
      <Container className="py-10">
        <ErrorCard message={error} />
        <div className="mt-4 text-center">
          <Link to="/hotels"><Button variant="secondary">Quay lại danh sách</Button></Link>
        </div>
      </Container>
    );
  }
  if (!hotel) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          Không tìm thấy khách sạn.
          <div className="mt-3"><Link to="/hotels"><Button variant="secondary">Quay lại danh sách</Button></Link></div>
        </Card>
      </Container>
    );
  }

  // Giá thấp nhất = min của các phòng (fallback về hotel.price_from nếu chưa có phòng)
  const minPrice = rooms.length > 0
    ? Math.min(...rooms.map((r) => Number(r.price_per_night || r.price || 0)))
    : Number(hotel.price_from || 0);

  const ratingLabel = getLabelByRating(Number(hotel.rating || 0));

  // Đọc lại param tìm kiếm từ Home để hiển thị thông tin chuyến đi
  const searchInfo = {
    checkIn:  sp.get("checkIn"),
    checkOut: sp.get("checkOut"),
    guests:   sp.get("guests"),
  };

  function scrollToRooms() {
    const el = document.getElementById("rooms");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-600">
          <Link className="text-[#0071c2] hover:underline" to="/">Trang chủ</Link> /{" "}
          <Link className="text-[#0071c2] hover:underline" to="/hotels">Khách sạn</Link> /{" "}
          <span className="text-slate-700 font-semibold">{hotel.name}</span>
        </div>

        {/* Header: tên + sao + rating */}
        <div className="mt-3 flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{hotel.name}</h1>
            <div className="mt-1 text-sm text-slate-600">
              {hotel.address} • <span className="font-semibold">{hotel.stars} sao</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-700">{ratingLabel}</div>
              <div className="text-xs text-slate-500">{hotel.reviews || 0} đánh giá</div>
            </div>
            <div className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">{hotel.rating}</div>
          </div>
        </div>

        {/* 3 highlight ngắn */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Hoàn huỷ miễn phí (tuỳ phòng)</div>
            <div className="text-xs text-slate-600 mt-1">Xem điều kiện hoàn huỷ trong bảng phòng.</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Thanh toán linh hoạt</div>
            <div className="text-xs text-slate-600 mt-1">Thanh toán online hoặc tại khách sạn.</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm font-extrabold text-slate-900">Giá tốt hôm nay</div>
            <div className="text-xs text-slate-600 mt-1">
              Giá từ <b>{formatVND(minPrice)}</b>/đêm.
            </div>
          </Card>
        </div>

        {/* Gallery */}
        <HotelGallery
          images={imageList}
          hotelName={hotel.name}
          onOpenGallery={() => setGalleryOpen(true)}
        />

        {/* Layout 8/4 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <HotelOverview
              hotel={hotel}
              searchInfo={searchInfo}
              onScrollToRooms={scrollToRooms}
            />
            <HotelRoomsTable
              hotelId={hotel.id}
              rooms={rooms}
              isLoggedIn={!!user}
            />
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-3">
              <HotelPriceSidebar
                hotel={hotel}
                minPrice={minPrice}
                ratingLabel={ratingLabel}
                isLoggedIn={!!user}
                onScrollToRooms={scrollToRooms}
              />
              <ReviewsSection hotelId={hotel.id} />
              <Link to="/hotels">
                <Button variant="secondary" className="w-full">Quay lại danh sách</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <HotelGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={imageList}
        title={hotel.name}
      />
    </div>
  );
}
