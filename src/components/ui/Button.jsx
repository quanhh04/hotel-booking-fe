export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#0071c2] text-white hover:bg-[#005fa3]",
    secondary: "bg-white text-[#0071c2] border border-[#0071c2] hover:bg-[#f0f7ff]",
    yellow: "bg-[#febb02] text-black hover:bg-[#e9aa00]",
    ghost: "bg-transparent text-white/90 hover:bg-white/10",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
