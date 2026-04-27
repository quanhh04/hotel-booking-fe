import { BOOKING_STATUS_LABELS } from "../../utils/constants";

/**
 * Pill nhỏ hiển thị trạng thái booking (CONFIRMED / PAID / CANCELLED ...).
 * Trạng thái "đang hoạt động" → xanh, các trạng thái còn lại → đỏ.
 */
export default function BookingStatusBadge({ status }) {
  const label = BOOKING_STATUS_LABELS[status] || status;
  const isActive = status === "CONFIRMED" || status === "PAID" || status === "PENDING";
  const cls = isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
