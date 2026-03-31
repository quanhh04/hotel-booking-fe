import { useRef, useState } from "react";

/**
 * DateInput hiển thị dd/mm/yyyy, cho phép nhập tay hoặc chọn từ calendar.
 * value/onChange vẫn dùng format yyyy-mm-dd (ISO) để gửi API.
 */
export default function DateInput({ value, onChange, className = "", ...props }) {
  const nativeRef = useRef(null);
  const [text, setText] = useState("");

  // yyyy-mm-dd → dd/mm/yyyy
  function toDisplay(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  // dd/mm/yyyy → yyyy-mm-dd
  function toISO(display) {
    const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return "";
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  function handleTextChange(e) {
    let raw = e.target.value.replace(/[^\d]/g, "");
    let formatted = "";
    for (let i = 0; i < raw.length && i < 8; i++) {
      if (i === 2 || i === 4) formatted += "/";
      formatted += raw[i];
    }
    setText(formatted);

    if (formatted.length === 10) {
      const iso = toISO(formatted);
      if (iso && !isNaN(new Date(iso).getTime())) {
        onChange({ target: { value: iso } });
      }
    }
  }

  function handleBlur() {
    setText(toDisplay(value));
  }

  function openPicker() {
    try { nativeRef.current?.showPicker(); }
    catch { nativeRef.current?.focus(); }
  }

  function handleNativeChange(e) {
    const iso = e.target.value;
    setText(toDisplay(iso));
    onChange({ target: { value: iso } });
  }

  // Hiển thị: nếu đang gõ thì dùng text, nếu không thì dùng value prop
  const displayText = document.activeElement?.dataset?.dateText ? text : (text || toDisplay(value));

  return (
    <div className="relative">
      <input
        data-date-text="true"
        type="text"
        inputMode="numeric"
        value={displayText}
        onChange={handleTextChange}
        onFocus={() => setText(toDisplay(value))}
        onBlur={handleBlur}
        placeholder="dd/mm/yyyy"
        maxLength={10}
        className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 pr-10 text-sm 
          text-slate-900 placeholder:text-slate-400
          outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        tabIndex={-1}
        aria-label="Chọn ngày"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
        </svg>
      </button>
      <input
        ref={nativeRef}
        type="date"
        value={value || ""}
        onChange={handleNativeChange}
        className="absolute bottom-0 right-2 w-0 h-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
