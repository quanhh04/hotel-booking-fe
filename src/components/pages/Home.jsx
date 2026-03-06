import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { hotels } from "../data/hotels";
import { useAuth } from "../auth/AuthContext";

function toYYYYMMDD(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pickCityImage(city) {
  const h = hotels.find((x) => String(x.city || "").toLowerCase().includes(String(city).toLowerCase()));
  return h?.images?.[0] || null;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const x = new Date();
    x.setDate(x.getDate() + 1);
    return x;
  }, []);

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState(toYYYYMMDD(today));
  const [checkOut, setCheckOut] = useState(toYYYYMMDD(tomorrow));
  const [guests, setGuests] = useState(2);

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");

  const popularCities = useMemo(() => {
    const map = new Map();
    for (const h of hotels) {
      const key = h.city || "Khác";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, []);

  const topHotels = useMemo(() => {
    return hotels
      .slice()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, []);

  const exploreVN = useMemo(() => {
    const items = [
      { city: "Đà Nẵng", title: "Đà Nẵng", subtitle: "Biển đẹp • Resort • Đồ ăn ngon" },
      { city: "Hà Nội", title: "Hà Nội", subtitle: "Phố cổ • Văn hoá • Ẩm thực" },
      { city: "TP. Hồ Chí Minh", title: "TP. Hồ Chí Minh", subtitle: "Trung tâm • Mua sắm • Nightlife" },
      { city: "Đà Lạt", title: "Đà Lạt", subtitle: "Chill • Cà phê • View đồi núi" },
      { city: "Nha Trang", title: "Nha Trang", subtitle: "Biển • Lặn ngắm san hô" },
      { city: "Phú Quốc", title: "Phú Quốc", subtitle: "Resort • Biển • Hoàng hôn" },
    ];

    return items.map((it) => ({
      ...it,
      image: pickCityImage(it.city),
    }));
  }, []);

  function buildSearchParams(customCity) {
    const params = new URLSearchParams();
    const finalCity = (customCity ?? city).trim();

    if (finalCity) params.set("city", finalCity);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    return params;
  }

  function onSubmit(e) {
    e.preventDefault();

    if (checkOut && checkIn && checkOut < checkIn) {
      setCheckOut(checkIn);
      return;
    }

    const params = buildSearchParams();
    navigate(`/hotels?${params.toString()}`);
  }

  function quickSearchCity(c) {
    setCity(c);
    const params = buildSearchParams(c);
    navigate(`/hotels?${params.toString()}`);
  }

  function onSubscribe(e) {
    e.preventDefault();
    setSubscribeMsg("");

    const email = subscribeEmail.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!ok) {
      setSubscribeMsg("Email chưa đúng định dạng. Tú nhập lại giúp mình nhé.");
      return;
    }

    // mock: lưu localStorage cho đồ án
    localStorage.setItem("bk_subscribe_email", email);
    setSubscribeMsg("Đã đăng ký nhận ưu đãi! (mock) 🎉");
    setSubscribeEmail("");
  }
  return (
    <>
      {/* HERO */}
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

          {/* SEARCH BAR */}
          <div className="mt-8">
            <Card className="border-4 border-[#febb02] p-3 md:p-4">
              <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-slate-600">Điểm đến</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                      placeholder="Nhập thành phố (VD: Đà Nẵng)"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-600">Ngày nhận phòng</label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-600">Ngày trả phòng</label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">Khách</label>
                    <Input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value || 1))}
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Button type="submit" variant="primary" className="w-full h-11">
                      Tìm
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </Container>

        {/* OFFERS BANNER */}
        <div className="pb-10">
          <Container>
            <div className="rounded-xl bg-gradient-to-r from-[#0a4fa3] to-[#003580] border border-white/10 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-white/90 font-semibold">
                    Ưu đãi dành cho thành viên
                  </div>
                  <div className="mt-1 text-xl md:text-2xl font-extrabold">
                    Giảm giá đặc biệt khi đăng nhập
                  </div>
                  <div className="mt-2 text-sm text-white/80">
                    Đăng nhập để xem ưu đãi riêng (mock) và lưu lịch sử đặt phòng.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/hotels?deal=1">
                    <Button className="bg-white text-[#003580] border-white" variant="secondary">
                      Khám phá ưu đãi
                    </Button>
                  </Link>

                  {user ? (
                    <div className="text-sm text-white/90 hidden md:block">
                      Xin chào <b>{user.name}</b> 👋
                    </div>
                  ) : (
                    <div className="text-sm text-white/80 hidden md:block">
                      Ưu đãi hiển thị trực tiếp trong danh sách.
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-white">
        <Container className="py-10">
          {/* Gợi ý */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Gợi ý cho chuyến đi</h2>
              <p className="text-sm text-slate-600 mt-1">
                Chọn phong cách du lịch phù hợp với bạn (mock).
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4 cursor-pointer hover:shadow-sm transition" onClick={() => quickSearchCity("Đà Nẵng")}>
              <div className="font-extrabold text-slate-900">Gần biển, nhiều resort</div>
              <div className="text-sm text-slate-600 mt-1">Đà Nẵng • Hội An • Nha Trang</div>
            </Card>

            <Card className="p-4 cursor-pointer hover:shadow-sm transition" onClick={() => quickSearchCity("Hà Nội")}>
              <div className="font-extrabold text-slate-900">Phố cổ, văn hoá</div>
              <div className="text-sm text-slate-600 mt-1">Hà Nội • Huế • Hội An</div>
            </Card>

            <Card className="p-4 cursor-pointer hover:shadow-sm transition" onClick={() => quickSearchCity("TP. Hồ Chí Minh")}>
              <div className="font-extrabold text-slate-900">Trung tâm, mua sắm</div>
              <div className="text-sm text-slate-600 mt-1">TP.HCM • Đà Lạt • Vũng Tàu</div>
            </Card>
          </div>

          {/* KHÁM PHÁ VIỆT NAM (có ảnh) */}
          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-slate-900">Khám phá Việt Nam</h2>
            <p className="text-sm text-slate-600 mt-1">
              Một vài điểm đến nổi bật (ảnh lấy từ dữ liệu khách sạn mock).
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {exploreVN.map((it) => (
                <div
                  key={it.city}
                  className="relative overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => quickSearchCity(it.city)}
                >
                  {it.image ? (
                    <img
                      src={it.image}
                      alt={it.title}
                      className="h-44 w-full object-cover group-hover:scale-[1.02] transition"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-44 w-full bg-slate-200" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white text-lg font-extrabold">{it.title}</div>
                    <div className="text-white/90 text-sm mt-1">{it.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Điểm đến phổ biến */}
          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-slate-900">Điểm đến phổ biến tại Việt Nam</h2>
            <p className="text-sm text-slate-600 mt-1">
              Dựa trên dữ liệu khách sạn (mock) trong hotels.js
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularCities.map((c) => (
                <Card
                  key={c.name}
                  className="p-4 cursor-pointer hover:shadow-sm transition"
                  onClick={() => quickSearchCity(c.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-slate-900">{c.name}</div>
                    <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {c.count} chỗ nghỉ
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Xem chỗ nghỉ nổi bật tại {c.name}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top hotels */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Chỗ nghỉ được đánh giá cao</h2>
                <p className="text-sm text-slate-600 mt-1">Top theo điểm rating (mock)</p>
              </div>

              <Button variant="secondary" onClick={() => navigate("/hotels")}>
                Xem tất cả
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topHotels.map((h) => (
                <Card
                  key={h.id}
                  className="overflow-hidden cursor-pointer hover:shadow-sm transition"
                  onClick={() => navigate(`/hotels/${h.id}`)}
                >
                  <div className="h-40 bg-slate-200">
                    {h.images?.[0] && (
                      <img
                        src={h.images[0]}
                        alt={h.name}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="p-3">
                    <div className="font-extrabold text-slate-900">{h.name}</div>
                    <div className="text-sm text-slate-600 mt-1">{h.city}</div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-600">{h.reviews || 0} đánh giá</span>
                      <span className="rounded-md bg-[#003580] px-2 py-1 text-xs font-extrabold text-white">
                        {h.rating}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotels/${h.id}`);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* NEWSLETTER / SUBSCRIBE */}
      <section className="bg-[#003580] text-white">
        <Container className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-2xl md:text-3xl font-extrabold">
              Tiết kiệm thời gian và tiền bạc!
            </div>
            <div className="mt-2 text-white/85">
              Đăng ký để nhận email ưu đãi và gợi ý du lịch (mock).
            </div>

            <form onSubmit={onSubscribe} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="h-12"
                />
                <Button type="submit" variant="primary" className="h-12 sm:w-40">
                  Đăng ký
                </Button>
              </div>

              {subscribeMsg && (
                <div className="mt-3 text-sm text-white/90">{subscribeMsg}</div>
              )}


            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
