/**
 * Thanh hiển thị 3 bước đặt phòng: Thông tin → Xem lại → Xác nhận.
 * Bước hiện tại tô màu xanh, các bước trước cũng coi như đã qua.
 */
export default function BookingStepper({ step }) {
  const item = (n, text) => (
    <div className="flex items-center gap-2">
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-extrabold ${
          step >= n ? "bg-[#0071c2] text-white" : "bg-slate-200 text-slate-600"
        }`}
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
