import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import DateInput from "../ui/DateInput";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useAuth } from "../../contexts/AuthContext";
import { useHotels } from "../../hooks/useHotels";
import { useAiTrending, useAiHistoryBased } from "../../hooks/useAiRecommendations";
import { cityApi } from "../../api/cityApi";
import { formatVND } from "../../utils/format";
import AiRoomCard from "../shared/AiRoomCard";

function toYYYYMMDD(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  // Fetch top-rated hotels
  const topFilters = useMemo(() => ({ sort_by: "rating", sort_order: "DESC", limit: 4 }), []);
  const { hotels: topHotels, loading: topLoading, error: topError, refetch: refetchTop } = useHotels(topFilters);

  // AI: trending rooms
  const { rooms: trendingRooms, loading: trendingLoading } = useAiTrending(7);

  // AI: history-based (only for logged-in users)
  const { recommendations: historyRooms, loading: historyLoading, message: historyMsg } = useAiHistoryBased(!!user);


  // Fetch destinations from API  // Fetch destinations from API
  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(true);
  const [destError, setDestError] = useState(null);

  const fetchDestinations = useCallback(async () => {
    setDestLoading(true);
    setDestError(null);
    try {
      const res = await cityApi.getCities(6);
      setDestinations(res.cities || res || []);
    } catch (err) {
      setDestError(err.message || "Không thể tải điểm đến");
    } finally {
      setDestLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

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
      setSubscribeMsg("Email chưa đúng định dạng.");
      return;
    }
    setSubscribeMsg("Đã đăng ký nhận ưu đãi! 🎉");
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
                    <DateInput value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-600">Ngày trả phòng</label>
                    <DateInput value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-slate-600">Khách</label>
                    <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value || 1))} className="mt-1" />
                  </div>
                  <div className="md:col-span-1">
                    <Button type="submit" variant="primary" className="w-full h-11">Tìm</Button>
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

      {/* BODY */}
      <section className="bg-white">
        <Container className="py-10">
          {/* Gợi ý */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Gợi ý cho chuyến đi</h2>
              <p className="text-sm text-slate-600 mt-1">Chọn phong cách du lịch phù hợp với bạn.</p>
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

          {/* KHÁM PHÁ VIỆT NAM */}
          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-slate-900">Khám phá Việt Nam</h2>
            <p className="text-sm text-slate-600 mt-1">Một vài điểm đến nổi bật.</p>

            {destLoading ? (
              <Spinner text="Đang tải điểm đến..." />
            ) : destError ? (
              <ErrorCard message={destError} onRetry={fetchDestinations} className="mt-4" />
            ) : destinations.length === 0 ? (
              <Card className="p-6 mt-4 text-center text-slate-600">Chưa có dữ liệu điểm đến.</Card>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {destinations.map((d) => (
                  <div key={d.id} className="relative overflow-hidden rounded-xl cursor-pointer group" onClick={() => quickSearchCity(d.name)}>
                    {d.thumbnail ? (
                      <img src={d.thumbnail} alt={d.name} className="h-44 w-full object-cover group-hover:scale-[1.02] transition" loading="lazy" />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-slate-300 to-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-white text-lg font-extrabold">{d.name}</div>
                      <div className="text-white/90 text-sm mt-1">
                        {d.subtitle || `${d.hotel_count} chỗ nghỉ`}
                        {d.min_price ? ` • Giá từ ${formatVND(d.min_price)}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top hotels */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Chỗ nghỉ được đánh giá cao</h2>
                <p className="text-sm text-slate-600 mt-1">Top theo điểm rating</p>
              </div>
              <Button variant="secondary" onClick={() => navigate("/hotels")}>Xem tất cả</Button>
            </div>

            {topLoading ? (
              <Spinner text="Đang tải khách sạn..." />
            ) : topError ? (
              <ErrorCard message={topError} onRetry={refetchTop} className="mt-4" />
            ) : topHotels.length === 0 ? (
              <Card className="p-6 mt-4 text-center text-slate-600">Chưa có dữ liệu khách sạn.</Card>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {topHotels.map((h) => (
                  <Card key={h.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition" onClick={() => navigate(`/hotels/${h.id}`)}>
                    <div className="h-40 bg-slate-200">
                      {h.images?.[0] && (
                        <img src={h.images[0]} alt={h.name} className="h-40 w-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-extrabold text-slate-900">{h.name}</div>
                      <div className="text-sm text-slate-600 mt-1">{h.city || h.address}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-600">{h.reviews || 0} đánh giá</span>
                        <span className="rounded-md bg-[#003580] px-2 py-1 text-xs font-extrabold text-white">{h.rating}</span>
                      </div>
                      {h.price_from && (
                        <div className="mt-2 text-sm text-slate-700">
                          Từ <span className="font-extrabold">{formatVND(h.price_from)}</span>
                        </div>
                      )}
                      <Button variant="primary" className="w-full mt-3" onClick={(e) => { e.stopPropagation(); navigate(`/hotels/${h.id}`); }}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* AI: TRENDING ROOMS */}
      {trendingRooms.length > 0 && (
        <section className="bg-white">
          <Container className="py-10">
            <h2 className="text-xl font-extrabold text-slate-900">🔥 Phòng đang hot</h2>
            <p className="text-sm text-slate-600 mt-1">Được đặt nhiều nhất trong 7 ngày qua</p>
            {trendingLoading ? (
              <Spinner text="Đang tải..." />
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {trendingRooms.slice(0, 4).map((r) => (
                  <AiRoomCard key={r.room_id} room={r} />
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* AI: HISTORY-BASED RECOMMENDATIONS */}
      {user && (
        <section className="bg-slate-50">
          <Container className="py-10">
            <h2 className="text-xl font-extrabold text-slate-900">✨ Gợi ý cho bạn</h2>
            <p className="text-sm text-slate-600 mt-1">Dựa trên lịch sử đặt phòng của bạn</p>
            {historyLoading ? (
              <Spinner text="Đang phân tích..." />
            ) : historyRooms?.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {historyRooms.slice(0, 4).map((r) => (
                  <AiRoomCard key={r.room_id} room={r} reason={r.reason} />
                ))}
              </div>
            ) : (
              <Card className="p-4 mt-4 text-sm text-slate-600">
                {historyMsg || "Hãy đặt phòng để nhận gợi ý phù hợp với sở thích của bạn."}
              </Card>
            )}
          </Container>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="bg-[#003580] text-white">
        <Container className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-2xl md:text-3xl font-extrabold">Tiết kiệm thời gian và tiền bạc!</div>
            <div className="mt-2 text-white/85">Đăng ký để nhận email ưu đãi và gợi ý du lịch.</div>
            <form onSubmit={onSubscribe} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input type="email" value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} placeholder="Email của bạn" className="h-12" />
                <Button type="submit" variant="primary" className="h-12 sm:w-40">Đăng ký</Button>
              </div>
              {subscribeMsg && <div className="mt-3 text-sm text-white/90">{subscribeMsg}</div>}
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
