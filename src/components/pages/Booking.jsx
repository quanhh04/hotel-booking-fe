import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { hotels, formatVND } from "../data/hotels";
import { useAuth } from "../auth/AuthContext";

const LS_BOOKINGS = "bk_bookings";

function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function createBooking(payload) {
  const list = safeParse(localStorage.getItem(LS_BOOKINGS), []);
  const id = globalThis.crypto?.randomUUID?.() || String(Date.now());
  const booking = {
    id,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  list.unshift(booking);
  localStorage.setItem(LS_BOOKINGS, JSON.stringify(list));
  return booking;
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

function calcDiscountPrice(price, discountPercent) {
  const p = Number(price || 0);
  const d = Number(discountPercent || 0);
  if (!d || d <= 0) return { hasDeal: false, original: p, final: p, discount: 0, saved: 0 };
  const final = Math.max(0, Math.round(p * (1 - d / 100)));
  return { hasDeal: true, original: p, final, discount: d, saved: Math.max(0, p - final) };
}

function Stepper({ step }) {
  const item = (n, text) => (
    <div className="flex items-center gap-2">
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-extrabold
        ${step >= n ? "bg-[#0071c2] text-white" : "bg-slate-200 text-slate-600"}`}
      >
        {n}
      </div>
      <div className={`text-sm font-semibold ${step >= n ? "text-slate-900" : "text-slate-500"}`}>
        {text}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      {item(1, "Thông tin")}
      <div className="hidden sm:block h-px w-10 bg-slate-200" />
      {item(2, "Xem lại")}
      <div className="hidden sm:block h-px w-10 bg-slate-200" />
      {item(3, "Xác nhận")}
    </div>
  );
}

export default function Booking() {
  const { id } = useParams(); // hotelId
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // route đã RequireAuth

  const hotel = useMemo(() => hotels.find((h) => String(h.id) === String(id)), [id]);
  const roomIdFromQuery = sp.get("roomId") || sp.get("room") || "";

  const room = useMemo(() => {
    if (!hotel) return null;
    const list = hotel.rooms || [];
    return list.find((r) => String(r.id) === String(roomIdFromQuery)) || list[0] || null;
  }, [hotel, roomIdFromQuery]);

  // --- state: trip details
  const [checkIn, setCheckIn] = useState(sp.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(sp.get("checkOut") || "");
  const [guests, setGuests] = useState(Number(sp.get("guests") || 2));
  const [roomsCount, setRoomsCount] = useState(Number(sp.get("rooms") || 1));

  // --- state: user details
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("VN");

  // --- extras
  const [arrivalTime, setArrivalTime] = useState("14:00-18:00");
  const [specialRequests, setSpecialRequests] = useState("");

  // --- payment (mock)
  const [paymentMethod, setPaymentMethod] = useState("pay_at_property"); // or card
  const [agree, setAgree] = useState(false);

  // --- flow
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [successId, setSuccessId] = useState("");

  if (!hotel) {
    return (
      <Container className="py-10">
        <Card className="p-6">
          Không tìm thấy khách sạn.
          <div className="mt-3">
            <Link to="/hotels">
              <Button variant="secondary">Quay lại danh sách</Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const nights = calcNights(checkIn, checkOut);
  const basePrice = Number(room?.price || hotel.priceFrom || 0);
  const deal = calcDiscountPrice(basePrice, hotel.discountPercent);
  const total = deal.final * Math.max(1, nights) * Math.max(1, roomsCount);
  const totalSaved = deal.saved * Math.max(1, nights) * Math.max(1, roomsCount);

  function validateStep1() {
    if (!checkIn || !checkOut) return "Vui lòng chọn ngày nhận/trả phòng.";
    if (checkOut < checkIn) return "Ngày trả phòng phải sau ngày nhận phòng.";
    if (nights <= 0) return "Số đêm không hợp lệ.";
    if (!fullName.trim()) return "Vui lòng nhập họ và tên.";
    if (!email.trim()) return "Vui lòng nhập email.";
    if (!agree) return "Vui lòng đồng ý với điều khoản để tiếp tục.";
    return "";
  }

  function goStep2() {
    const msg = validateStep1();
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    setStep(2);
  }

  function goStep3() {
    setErr("");
    setStep(3);
  }

  function onConfirm() {
    // Final confirm (mock)
    const booking = createBooking({
      userId: user.id,
      userEmail: user.email,
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      address: hotel.address,
      roomId: room?.id || "",
      roomType: room?.type || "",
      checkIn,
      checkOut,
      nights,
      guests: Math.max(1, guests),
      rooms: Math.max(1, roomsCount),
      discountPercent: Number(hotel.discountPercent || 0),
      pricePerNightOriginal: deal.original,
      pricePerNightFinal: deal.final,
      total,
      customer: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
      },
      extras: { arrivalTime, specialRequests: specialRequests.trim() },
      payment: { method: paymentMethod, status: "MOCK_SUCCESS" },
    });

    setSuccessId(booking.id);
  }

  // Success screen
  if (successId) {
    return (
      <Container className="py-10">
        <Card className="p-6 text-center">
          <div className="text-2xl font-extrabold text-slate-900">✅ Đặt phòng thành công!</div>
          <div className="mt-2 text-sm text-slate-600">
            Mã đơn: <span className="font-semibold">{successId}</span> (mock)
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/me/bookings">
              <Button variant="primary">Xem lịch sử đặt phòng</Button>
            </Link>
            <Link to={`/hotels/${hotel.id}`}>
              <Button variant="secondary">Quay lại khách sạn</Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Hoàn tất đặt phòng</h1>
          <div className="text-sm text-slate-600 mt-1">
            {hotel.name} • {hotel.city}
          </div>
        </div>

        <Stepper step={step} />
      </div>

      {err && (
        <Card className="p-3 mt-3 border border-red-200 bg-red-50 text-red-700 text-sm">
          {err}
        </Card>
      )}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-4">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              {/* Trip details */}
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-extrabold text-slate-900">Chi tiết chuyến đi</h2>
                  <Link to={`/hotels/${hotel.id}`} className="text-sm text-[#0071c2] hover:underline">
                    Sửa lựa chọn
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Ngày nhận phòng</label>
                    <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Ngày trả phòng</label>
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Số khách</label>
                    <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value || 1))} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Số phòng</label>
                    <Input type="number" min={1} value={roomsCount} onChange={(e) => setRoomsCount(Number(e.target.value || 1))} className="mt-1" />
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-700">
                  <b>Đã chọn:</b> {room?.type || "Phòng"} • <b>{nights}</b> đêm
                </div>

                {deal.hasDeal && (
                  <div className="mt-2 text-xs text-[#008234] font-semibold">
                    Ưu đãi: Giảm {deal.discount}% (mock)
                  </div>
                )}
              </Card>

              {/* Guest details */}
              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Thông tin của bạn</h2>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Họ và tên</label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Quốc gia/khu vực</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    >
                      <option value="VN">Việt Nam</option>
                      <option value="US">United States</option>
                      <option value="SG">Singapore</option>
                      <option value="JP">Japan</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Final details */}
              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Thông tin bổ sung</h2>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Giờ đến dự kiến</label>
                    <select
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    >
                      <option value="14:00-18:00">14:00 – 18:00</option>
                      <option value="18:00-21:00">18:00 – 21:00</option>
                      <option value="21:00-00:00">21:00 – 00:00</option>
                      <option value="after_00">Sau 00:00</option>
                    </select>
                    <div className="text-xs text-slate-500 mt-1">(mock) Thông tin để lễ tân chuẩn bị.</div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Phương thức thanh toán</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    >
                      <option value="pay_at_property">Thanh toán tại chỗ (mock)</option>
                      <option value="card">Thẻ (mock)</option>
                    </select>
                    <div className="text-xs text-slate-500 mt-1">(demo) Không xử lý giao dịch thật.</div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-600">Yêu cầu đặc biệt (tuỳ chọn)</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    placeholder="VD: phòng tầng cao, giường phụ..."
                  />
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#0071c2]"
                  />
                  <div className="text-sm text-slate-700">
                    Tôi đồng ý với{" "}
                    <span className="text-[#0071c2] font-semibold">điều khoản</span> và{" "}
                    <span className="text-[#0071c2] font-semibold">chính sách</span> (mock).
                  </div>
                </div>
              </Card>

              <div className="flex gap-2 justify-end">
                <Button variant="primary" className="h-11 px-6" onClick={goStep2}>
                  Tiếp tục
                </Button>
              </div>
            </>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <>
              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Xem lại thông tin</h2>

                <div className="mt-3 text-sm text-slate-700 space-y-2">
                  <div><b>Khách sạn:</b> {hotel.name}</div>
                  <div><b>Phòng:</b> {room?.type}</div>
                  <div><b>Ngày:</b> {checkIn} → {checkOut} • <b>{nights}</b> đêm</div>
                  <div><b>Khách:</b> {guests} • <b>Phòng:</b> {roomsCount}</div>
                  <div><b>Khách đặt:</b> {fullName} • {email}</div>
                  <div><b>Giờ đến:</b> {arrivalTime}</div>
                  <div><b>Thanh toán:</b> {paymentMethod === "card" ? "Thẻ (mock)" : "Thanh toán tại chỗ (mock)"}</div>
                  {specialRequests.trim() && <div><b>Yêu cầu:</b> {specialRequests.trim()}</div>}
                </div>

                <Card className="p-3 bg-slate-50 mt-4">
                  <div className="text-sm text-slate-700">
                    Chính sách huỷ (mock):{" "}
                    <span className="font-semibold">
                      {room?.refundable ? "Có hoàn huỷ (tuỳ điều kiện)" : "Không hoàn huỷ"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    * Booking.com thường hiển thị chính sách rất rõ — phần này là mô phỏng.
                  </div>
                </Card>
              </Card>

              <div className="flex gap-2 justify-between">
                <Button variant="secondary" className="h-11" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button variant="primary" className="h-11 px-6" onClick={goStep3}>
                  Tiếp tục
                </Button>
              </div>
            </>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <>
              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Xác nhận đặt phòng</h2>

                <div className="mt-2 text-sm text-slate-700">
                  Bằng cách bấm <b>“Xác nhận đặt phòng”</b>, bạn đồng ý tạo đơn đặt phòng (mock) và lưu vào lịch sử.
                </div>

                <Card className="p-3 bg-slate-50 mt-4">
                  <div className="text-sm text-slate-700">
                    {paymentMethod === "card"
                      ? "Thanh toán thẻ (mock): xem như thanh toán thành công."
                      : "Thanh toán tại chỗ (mock): xem như đơn đã xác nhận."}
                  </div>
                </Card>

                <div className="mt-4 flex gap-2 justify-between">
                  <Button variant="secondary" className="h-11" onClick={() => setStep(2)}>
                    Quay lại
                  </Button>
                  <Button variant="primary" className="h-11 px-6" onClick={onConfirm}>
                    Xác nhận đặt phòng
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* RIGHT: Summary sticky */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-4 space-y-3">
            <Card className="p-4 border-2 border-[#febb02]">
              <div className="font-extrabold text-slate-900">Tóm tắt đặt phòng</div>

              <div className="mt-2 text-sm text-slate-700">
                <div className="font-semibold">{hotel.name}</div>
                <div className="text-slate-600">{hotel.city} • {hotel.address}</div>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Phòng</span>
                  <span className="font-semibold">{room?.type || "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Ngày</span>
                  <span className="font-semibold">{checkIn && checkOut ? `${checkIn} → ${checkOut}` : "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Số đêm</span>
                  <span className="font-semibold">{nights}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Số phòng</span>
                  <span className="font-semibold">{Math.max(1, roomsCount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Giá/đêm</span>
                  <span className="font-semibold">{formatVND(deal.final)}</span>
                </div>

                {deal.hasDeal && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 line-through">{formatVND(deal.original)}</span>
                      <span className="text-[#008234] font-semibold">Giảm {deal.discount}%</span>
                    </div>
                    <div className="text-xs text-[#008234] font-semibold">
                      Bạn tiết kiệm ~ {formatVND(totalSaved)}
                    </div>
                  </>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-600">Tổng</span>
                  <span className="font-extrabold text-slate-900">{formatVND(total)}</span>
                </div>

                <div className="text-xs text-slate-500">
                  * Tổng = giá/đêm × số đêm × số phòng (mock)
                </div>
              </div>
            </Card>

            <Link to="/me/bookings">
              <Button variant="secondary" className="w-full">Lịch sử đặt phòng</Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}