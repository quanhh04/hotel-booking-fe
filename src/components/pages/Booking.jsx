import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import ErrorCard from "../ui/ErrorCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useHotelDetail } from "../../hooks/useHotelDetail";
import { bookingApi } from "../../api/bookingApi";

import BookingStepper from "../booking/BookingStepper";
import BookingTripStep from "../booking/BookingTripStep";
import BookingReviewStep from "../booking/BookingReviewStep";
import BookingConfirmStep from "../booking/BookingConfirmStep";
import BookingSummary from "../booking/BookingSummary";
import BookingSuccess from "../booking/BookingSuccess";

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

export default function Booking() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const { hotel, rooms, loading: pageLoading, error: pageError } = useHotelDetail(id);

  const roomIdFromQuery = sp.get("roomId") || sp.get("room") || "";
  const room = useMemo(() => {
    if (!rooms.length) return null;
    return rooms.find((r) => String(r.id) === String(roomIdFromQuery)) || rooms[0];
  }, [rooms, roomIdFromQuery]);

  // Form state
  const [checkIn, setCheckIn]   = useState(sp.get("checkIn")  || "");
  const [checkOut, setCheckOut] = useState(sp.get("checkOut") || "");
  const [guests, setGuests]     = useState(Number(sp.get("guests") || 2));
  const [fullName, setFullName] = useState(user?.display_name || user?.email || "");
  const [email, setEmail]       = useState(user?.email || "");
  const [phone, setPhone]       = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod]     = useState("pay_at_hotel");
  const [specialRequests, setSpecialRequests] = useState("");

  // Flow state
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

  const nights         = calcNights(checkIn, checkOut);
  const pricePerNight  = Number(room?.price_per_night || room?.price || hotel.price_from || 0);
  const total          = pricePerNight * Math.max(1, nights);

  function validateStep1() {
    if (!checkIn || !checkOut)         return "Vui lòng chọn ngày nhận/trả phòng.";
    if (checkOut < checkIn)            return "Ngày trả phòng phải sau ngày nhận phòng.";
    if (nights <= 0)                   return "Số đêm không hợp lệ.";
    if (!fullName.trim())              return "Vui lòng nhập họ và tên.";
    if (!email.trim())                 return "Vui lòng nhập email.";
    return "";
  }

  function goStep2() {
    const msg = validateStep1();
    if (msg) { toast.error(msg); return; }
    setStep(2);
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
      setSuccessId(booking.id);
    } catch (error) {
      toast.error(error.message || "Đã có lỗi xảy ra khi đặt phòng");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return <BookingSuccess bookingId={successId} paymentMethod={paymentMethod} hotel={hotel} />;
  }

  return (
    <Container className="py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Hoàn tất đặt phòng</h1>
          <div className="text-sm text-slate-600 mt-1">{hotel.name} • {hotel.address}</div>
        </div>
        <BookingStepper step={step} />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Form theo bước */}
        <div className="lg:col-span-8 space-y-4">
          {step === 1 && (
            <BookingTripStep
              hotel={hotel} room={room} nights={nights}
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              guests={guests} setGuests={setGuests}
              fullName={fullName} setFullName={setFullName}
              email={email} setEmail={setEmail}
              phone={phone} setPhone={setPhone}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              specialRequests={specialRequests} setSpecialRequests={setSpecialRequests}
              onNext={goStep2}
            />
          )}

          {step === 2 && (
            <BookingReviewStep
              hotel={hotel} room={room}
              checkIn={checkIn} checkOut={checkOut} nights={nights} guests={guests}
              fullName={fullName} email={email}
              paymentMethod={paymentMethod} specialRequests={specialRequests}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <BookingConfirmStep
              submitting={submitting}
              onBack={() => setStep(2)}
              onConfirm={onConfirm}
            />
          )}
        </div>

        {/* RIGHT: Tóm tắt giá - hiển thị xuyên suốt 3 bước */}
        <div className="lg:col-span-4">
          <BookingSummary
            hotel={hotel} room={room}
            checkIn={checkIn} checkOut={checkOut}
            nights={nights} pricePerNight={pricePerNight} total={total}
          />
        </div>
      </div>
    </Container>
  );
}
