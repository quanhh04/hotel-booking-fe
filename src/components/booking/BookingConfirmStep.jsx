import Card from "../ui/Card";
import Button from "../ui/Button";

/**
 * Bước 3 — Xác nhận cuối cùng. Bấm nút này → gọi API tạo booking.
 */
export default function BookingConfirmStep({ submitting, onBack, onConfirm }) {
  return (
    <Card className="p-4">
      <h2 className="font-extrabold text-slate-900">Xác nhận đặt phòng</h2>
      <div className="mt-2 text-sm text-slate-700">
        Bằng cách bấm <b>"Xác nhận đặt phòng"</b>, bạn đồng ý tạo đơn đặt phòng.
      </div>
      <div className="mt-4 flex gap-2 justify-between">
        <Button variant="secondary" className="h-11" onClick={onBack}>Quay lại</Button>
        <Button variant="primary" className="h-11 px-6" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
        </Button>
      </div>
    </Card>
  );
}
