import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

import HomeSearchBar from "../home/HomeSearchBar";
import HomeQuickPicks from "../home/HomeQuickPicks";
import HomeDestinations from "../home/HomeDestinations";
import HomeTopHotels from "../home/HomeTopHotels";
import HomeNewsletter from "../home/HomeNewsletter";

/**
 * Trang chủ — Gồm nhiều section ráp nối lại:
 *   1. Hero + thanh tìm kiếm  (HomeSearchBar)
 *   2. Banner ưu đãi
 *   3. Quick picks            (HomeQuickPicks)
 *   4. Khám phá Việt Nam      (HomeDestinations)
 *   5. Top hotels             (HomeTopHotels)
 *   6. Đăng ký newsletter     (HomeNewsletter)
 *
 * State search (city/checkIn/checkOut/guests) đặt ở đây vì cần dùng cho cả
 * thanh tìm kiếm chính và các nút "Tìm nhanh theo điểm đến".
 */

// "yyyy-mm-dd" cho thẻ <input type="date">
function toYYYYMMDD(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mặc định: nhận phòng = hôm nay, trả phòng = ngày mai
  const today    = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const x = new Date();
    x.setDate(x.getDate() + 1);
    return x;
  }, []);

  const [city, setCity]         = useState("");
  const [checkIn, setCheckIn]   = useState(toYYYYMMDD(today));
  const [checkOut, setCheckOut] = useState(toYYYYMMDD(tomorrow));
  const [guests, setGuests]     = useState(2);

  // Tạo query string `?city=...&checkIn=...` rồi điều hướng sang /hotels
  function goToSearch(customCity) {
    const finalCity = (customCity ?? city).trim();
    const params = new URLSearchParams();
    if (finalCity) params.set("city", finalCity);
    if (checkIn)   params.set("checkIn", checkIn);
    if (checkOut)  params.set("checkOut", checkOut);
    if (guests)    params.set("guests", String(guests));
    navigate(`/hotels?${params.toString()}`);
  }

  function onSubmit(e) {
    e.preventDefault();
    // Trả phòng < nhận phòng → tự sửa thành đúng nhận phòng (UX nhẹ nhàng)
    if (checkOut && checkIn && checkOut < checkIn) {
      setCheckOut(checkIn);
      return;
    }
    goToSearch();
  }

  function quickSearchCity(c) {
    setCity(c);
    goToSearch(c);
  }

  return (
    <>
      {/* ===== HERO + Search Bar ===== */}
      <section className="bg-[#003580] text-white">
        <Container className="pt-10 pb-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Tìm chỗ nghỉ tiếp theo
            </h1>
            <p className="mt-3 text-white/90 text-lg">
              Tìm ưu đãi khách sạn, nhà nghỉ và nhiều hơn nữa...
            </p>
          </div>

          <div className="mt-8">
            <HomeSearchBar
              city={city} setCity={setCity}
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              guests={guests} setGuests={setGuests}
              onSubmit={onSubmit}
            />
          </div>
        </Container>

        {/* ===== Banner ưu đãi ===== */}
        <div className="pb-10">
          <Container>
            <div className="rounded-xl bg-gradient-to-r from-[#0a4fa3] to-[#003580] border border-white/10 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-white/90 font-semibold">Ưu đãi dành cho thành viên</div>
                  <div className="mt-1 text-xl md:text-2xl font-extrabold">Giảm giá đặc biệt khi đăng nhập</div>
                  <div className="mt-2 text-sm text-white/80">Đăng nhập để xem ưu đãi riêng và lưu lịch sử đặt phòng.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/hotels?deal=1">
                    <Button className="bg-white text-[#003580] border-white" variant="secondary">Khám phá ưu đãi</Button>
                  </Link>
                  {user ? (
                    <div className="text-sm text-white/90 hidden md:block">
                      Xin chào <b>{user.display_name || user.email}</b> 👋
                    </div>
                  ) : (
                    <div className="text-sm text-white/80 hidden md:block">Ưu đãi hiển thị trực tiếp trong danh sách.</div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* ===== Body trắng: quick picks + destinations + top hotels ===== */}
      <section className="bg-white">
        <Container className="py-10">
          <HomeQuickPicks onPick={quickSearchCity} />
          <HomeDestinations onPick={quickSearchCity} />
          <HomeTopHotels />
        </Container>
      </section>

      {/* ===== Newsletter ===== */}
      <HomeNewsletter />
    </>
  );
}
