export default function Spinner({ text = "Đang tải...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0071c2]" />
      {text && <p className="mt-3 text-sm text-slate-500">{text}</p>}
    </div>
  );
}
