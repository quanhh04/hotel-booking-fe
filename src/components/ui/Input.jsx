export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm 
      text-slate-900 placeholder:text-slate-400
      outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15 ${className}`}
      {...props}
    />
  );
}
