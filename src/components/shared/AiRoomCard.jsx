import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatVND } from "../../utils/format";
import { aiApi } from "../../api/aiApi";

export default function AiRoomCard({ room, reason }) {
  function onClick() {
    if (room.room_id) {
      aiApi.trackClick(room.room_id).catch(() => {});
    }
  }

  return (
    <Card className="p-3 hover:shadow-sm transition">
      <div className="flex flex-col h-full">
        <div className="font-semibold text-slate-900 text-sm">{room.room_name || room.name}</div>
        <div className="text-xs text-slate-600 mt-1">{room.hotel_name}</div>
        <div className="text-xs text-slate-500">{room.hotel_address}</div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {room.price_per_night && (
            <span className="text-sm font-semibold text-slate-900">{formatVND(room.price_per_night)}/đêm</span>
          )}
          {room.max_guests && (
            <span className="text-xs text-slate-500">• {room.max_guests} khách</span>
          )}
        </div>

        {(room.amenities || []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{a}</span>
            ))}
          </div>
        )}

        {reason && (
          <div className="mt-2 text-xs text-[#0071c2]">{reason}</div>
        )}

        {room.percent_change != null && room.percent_change > 0 && (
          <div className="mt-1 text-xs text-green-600 font-semibold">🔥 +{room.percent_change}% so với tuần trước</div>
        )}

        <div className="mt-auto pt-3">
          <Link to={`/hotels/${room.hotel_id || ""}`} onClick={onClick}>
            <Button variant="primary" className="w-full text-xs">Xem khách sạn</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
