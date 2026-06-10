import { useNearbyServices } from "../../hooks/useNearbyServices";

const CATEGORY_META = {
  food: { label: "Ăn uống", icon: "🍜", color: "orange" },
  attraction: { label: "Tham quan", icon: "🏛️", color: "blue" },
  wellness: { label: "Spa & Wellness", icon: "🧘", color: "green" },
  transport: { label: "Di chuyển", icon: "🚗", color: "purple" },
  nightlife: { label: "Nightlife", icon: "🌙", color: "pink" },
};

const COLOR_MAP = {
  orange: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  green: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
  pink: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
};

const ACTIVE_COLOR_MAP = {
  orange: "border-orange-500 bg-orange-500 text-white",
  blue: "border-blue-500 bg-blue-500 text-white",
  green: "border-green-500 bg-green-500 text-white",
  purple: "border-purple-500 bg-purple-500 text-white",
  pink: "border-pink-500 bg-pink-500 text-white",
};

function ServiceCard({ service }) {
  const meta = CATEGORY_META[service.category] || { icon: "📍", color: "blue" };

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition bg-white">
      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-900 text-sm leading-tight">{service.name}</h4>
          {service.rating && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">
              ⭐ {service.rating}
            </span>
          )}
        </div>
        {service.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{service.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {service.distance && (
            <span className="text-xs text-slate-400">📍 {service.distance}</span>
          )}
          {service.price_range && (
            <span className="text-xs text-slate-400">💰 {service.price_range}</span>
          )}
        </div>
        {/* Tags */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {service.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {service.map_url && (
            <a
              href={service.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium"
            >
              🗺️ Bản đồ
            </a>
          )}
          {service.website_url && (
            <a
              href={service.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium"
            >
              🌐 Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị dịch vụ lân cận khách sạn.
 * Dùng trong BookingSuccess sau khi đặt phòng thành công.
 */
export default function NearbyServices({ hotelId }) {
  const { services, categories, loading, error, activeCategory, selectCategory } = useNearbyServices(hotelId);

  if (loading && services.length === 0) {
    return (
      <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 w-20 bg-slate-200 rounded-full" />)}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || categories.length === 0) return null;

  return (
    <div className="mt-6 p-5 rounded-xl border border-slate-200 bg-white">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <span className="text-lg">🗺️</span>
        Khám phá khu vực
      </h3>
      <p className="text-xs text-slate-500 mt-1">
        Dịch vụ & địa điểm hay ho gần khách sạn của bạn
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mt-3">
        {categories.map(({ category, count }) => {
          const meta = CATEGORY_META[category] || { label: category, icon: "📍", color: "blue" };
          const isActive = activeCategory === category;
          const colorClass = isActive
            ? ACTIVE_COLOR_MAP[meta.color]
            : COLOR_MAP[meta.color];

          return (
            <button
              key={category}
              onClick={() => selectCategory(category)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition font-medium ${colorClass}`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className={`text-[10px] ${isActive ? "opacity-80" : "opacity-60"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Service list */}
      <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
        {services.length === 0 && !loading && (
          <p className="text-sm text-slate-400 text-center py-4">
            Chưa có thông tin dịch vụ cho khu vực này.
          </p>
        )}
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {loading && services.length > 0 && (
        <div className="text-center py-2">
          <span className="text-xs text-slate-400">Đang tải...</span>
        </div>
      )}
    </div>
  );
}
