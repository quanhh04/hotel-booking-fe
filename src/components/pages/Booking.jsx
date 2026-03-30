import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { hotelApi } from "../../api/hotelApi";
import { bookingApi } from "../../api/bookingApi";
import { formatVND, formatDate } from "../../utils/format";

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

function Stepper({ step }) {
  const item = (n, text) => (
    <div className="flex items-center gap-2">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-extrabold ${step >= n ? "bg-[#0071c2] text-white" : "bg-slate-200 text-slate-600"}`}>
        {n}
      </div>
      <div className={`text-sm font-semibold ${step >= n ? "text-slate-900" : "text-slate-500"}`}>{text}</div>
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
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const toast = useToast();

  // Fetch hotel + rooms from API
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function load() {
      setPageLoading(true);
      setPageError("");
      try {
        const [hotelData, roomsData] = await Promise.all([
          hotelApi.getHotelDetail(id),
          hotelApi.getHotelRooms(id),
        ]);
        setHotel(hotelData);
        setRooms(roomsData.rooms || roomsData || []);
      } catch (err) {
        setPageError(err.message || "Không thể tải thông tin khách sạn");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [id]);

  const roomIdFromQuery = sp.get("roomId") || sp.get("room") || "";

  const room = useMemo(() => {
    if (!rooms.length) return null;
    return rooms.find((r) => String(r.id) === String(roomIdFromQuery)) || rooms[0] || null;
  }, [rooms, roomIdFromQuery]);

  // Trip details
  const [checkIn, setCheckIn] = useState(sp.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(sp.get("checkOut") || "");
  const [guests, setGuests] = useState(Number(sp.get("guests") || 2));

  // User details
  const [fullName, setFullName] = useState(user?.display_name || user?.email || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("pay_at_hotel");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agree, setAgree] = useState(false);

  // Flow
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState("");

  if (pageLoading) {
    return <Container className="py-10"><Spinner text="Đang tải thông tin đặt phòng..." /></Container>;
  }

  if (pageError) {
    return <Container className="py-10"><ErrorCard message={pageError} /></Container>;
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

  const nights = calcNights(checkIn, checkOut);
  const pricePerNight = Number(room?.price_per_night || room?.price || hotel.price_from || 0);
  const total = pricePerNight * Math.max(1, nights);

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
    if (msg) { toast.error(msg); return; }
    setStep(2);
  }

  function goStep3() {
    setStep(3);
  }

  async function onConfirm() {
    setSubmitting(true);
    try {
      const booking = await bookingApi.createBooking({
        room_type_id: room?.id,
        check_in: checkIn,
        check_out: checkOut,
        payment_method: paymentMethod,
      });
      setSuccessId(booking.id || booking.data?.id);
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra khi đặt phòng");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (successId) {
    return (
      <Container className="py-10">
        <Card className="p-6 text-center">
          <div className="text-2xl font-extrabold text-slate-900">✅ Đặt phòng thành công!</div>
          <div className="mt-2 text-sm text-slate-600">
            Mã đơn: <span className="font-semibold">{successId}</span>
          </div>

          {paymentMethod === "online" && (
            <Card className="mt-4 p-4 border-2 border-[#febb02] bg-[#fff8e1] text-left">
              <div className="text-sm font-semibold text-slate-900">💳 Thanh toán online</div>
              <div className="text-xs text-slate-600 mt-1">Đơn đặt phòng đang chờ thanh toán. Bấm nút bên dưới để thanh toán ngay.</div>
              <div className="mt-3">
                <Link to="/me/bookings"><Button variant="primary">Đi tới thanh toán →</Button></Link>
              </div>
            </Card>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/me/bookings"><Button variant="primary">Xem lịch sử đặt phòng</Button></Link>
            <Link to={`/hotels/${hotel.id}`}><Button variant="secondary">Quay lại khách sạn</Button></Link>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Hoàn tất đặt phòng</h1>
          <div className="text-sm text-slate-600 mt-1">{hotel.name} • {hotel.address}</div>
        </div>
        <Stepper step={step} />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-4">
          {step === 1 && (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-extrabold text-slate-900">Chi tiết chuyến đi</h2>
                  <Link to={`/hotels/${hotel.id}`} className="text-sm text-[#0071c2] hover:underline">Sửa lựa chọn</Link>
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
                </div>
                <div className="mt-3 text-sm text-slate-700">
                  <b>Đã chọn:</b> {room?.name || "Phòng"} • <b>{nights}</b> đêm
                </div>
              </Card>

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
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Thông tin bổ sung</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Phương thức thanh toán</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15">
                      <option value="pay_at_hotel">Thanh toán tại khách sạn</option>
                      <option value="online">Thanh toán online</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-600">Yêu cầu đặc biệt (tuỳ chọn)</label>
                  <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15"
                    placeholder="VD: phòng tầng cao, giường phụ..." />
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0071c2]" />
                  <div className="text-sm text-slate-700">
                    Tôi đồng ý với <span className="text-[#0071c2] font-semibold">điều khoản</span> và <span className="text-[#0071c2] font-semibold">chính sách</span>.
                  </div>
                </div>
              </Card>
              <div className="flex gap-2 justify-end">
                <Button variant="primary" className="h-11 px-6" onClick={goStep2}>Tiếp tục</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Card className="p-4">
                <h2 className="font-extrabold text-slate-900">Xem lại thông tin</h2>
                <div className="mt-3 text-sm text-slate-700 space-y-2">
                  <div><b>Khách sạn:</b> {hotel.name}</div>
                  <div><b>Phòng:</b> {room?.name}</div>
                  <div><b>Ngày:</b> {formatDate(checkIn)} → {formatDate(checkOut)} • <b>{nights}</b> đêm</div>
                  <div><b>Khách:</b> {guests}</div>
                  <div><b>Khách đặt:</b> {fullName} • {email}</div>
                  <div><b>Thanh toán:</b> {paymentMethod === "online" ? "Thanh toán online" : "Thanh toán tại khách sạn"}</div>
                  {specialRequests.trim() && <div><b>Yêu cầu:</b> {specialRequests.trim()}</div>}
                </div>
              </Card>
              <div className="flex gap-2 justify-between">
                <Button variant="secondary" className="h-11" onClick={() => setStep(1)}>Quay lại</Button>
                <Button variant="primary" className="h-11 px-6" onClick={goStep3}>Tiếp tục</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <Card className="p-4">
              <h2 className="font-extrabold text-slate-900">Xác nhận đặt phòng</h2>
              <div className="mt-2 text-sm text-slate-700">
                Bằng cách bấm <b>"Xác nhận đặt phòng"</b>, bạn đồng ý tạo đơn đặt phòng.
              </div>
              <div className="mt-4 flex gap-2 justify-between">
                <Button variant="secondary" className="h-11" onClick={() => setStep(2)}>Quay lại</Button>
                <Button variant="primary" className="h-11 px-6" onClick={onConfirm} disabled={submitting}>
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-4 space-y-3">
            <Card className="p-4 border-2 border-[#febb02]">
              <div className="font-extrabold text-slate-900">Tóm tắt đặt phòng</div>
              <div className="mt-2 text-sm text-slate-700">
                <div className="font-semibold">{hotel.name}</div>
                <div className="text-slate-600">{hotel.address}</div>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Phòng</span>
                  <span className="font-semibold">{room?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ngày</span>
                  <span className="font-semibold">{checkIn && checkOut ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Số đêm</span>
                  <span className="font-semibold">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Giá/đêm</span>
                  <span className="font-semibold">{formatVND(pricePerNight)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-600">Tổng</span>
                  <span className="font-extrabold text-slate-900">{formatVND(total)}</span>
                </div>
                <div className="text-xs text-slate-500">* Tổng = giá/đêm × số đêm</div>
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
