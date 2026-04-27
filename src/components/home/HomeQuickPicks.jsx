import Card from "../ui/Card";

/**
 * 3 thẻ "Gợi ý theo phong cách du lịch".
 * Bấm vào → set city + chuyển sang trang /hotels.
 */
export default function HomeQuickPicks({ onPick }) {
  const picks = [
    { city: "Đà Nẵng",         title: "Gần biển, nhiều resort",  hint: "Đà Nẵng • Hội An • Nha Trang" },
    { city: "Hà Nội",          title: "Phố cổ, văn hoá",          hint: "Hà Nội • Huế • Hội An" },
    { city: "TP. Hồ Chí Minh", title: "Trung tâm, mua sắm",       hint: "TP.HCM • Đà Lạt • Vũng Tàu" },
  ];

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Gợi ý cho chuyến đi</h2>
          <p className="text-sm text-slate-600 mt-1">Chọn phong cách du lịch phù hợp với bạn.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {picks.map((p) => (
          <Card
            key={p.city}
            className="p-4 cursor-pointer hover:shadow-sm transition"
            onClick={() => onPick(p.city)}
          >
            <div className="font-extrabold text-slate-900">{p.title}</div>
            <div className="text-sm text-slate-600 mt-1">{p.hint}</div>
          </Card>
        ))}
      </div>
    </>
  );
}
