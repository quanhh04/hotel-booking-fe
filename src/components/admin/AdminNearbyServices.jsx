import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { hotelApi } from "../../api/hotelApi";
import { useToast } from "../../contexts/ToastContext";

const CATEGORIES = [
  { value: "food", label: "🍜 Ăn uống" },
  { value: "attraction", label: "🏛️ Tham quan" },
  { value: "wellness", label: "🧘 Wellness" },
  { value: "transport", label: "🚗 Di chuyển" },
  { value: "nightlife", label: "🌙 Nightlife" },
];

const EMPTY_FORM = {
  hotel_id: "",
  category: "food",
  name: "",
  description: "",
  address: "",
  distance: "",
  rating: "",
  price_range: "",
  map_url: "",
  website_url: "",
  tags: "",
};

export default function AdminNearbyServices() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Filters
  const [filterHotelId, setFilterHotelId] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);

  // Hotels for dropdown
  const [hotels, setHotels] = useState([]);

  const fetchHotels = useCallback(async () => {
    try {
      const res = await hotelApi.getHotels({ limit: 100 });
      setHotels(res.hotels || []);
    } catch { /* ignore */ }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterHotelId) params.hotel_id = filterHotelId;
      if (filterCategory) params.category = filterCategory;
      const res = await adminApi.getNearbyServices(params);
      setServices(res.services || []);
      setTotal(res.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterHotelId, filterCategory, page]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      hotel_id: String(s.hotel_id),
      category: s.category,
      name: s.name || "",
      description: s.description || "",
      address: s.address || "",
      distance: s.distance || "",
      rating: s.rating != null ? String(s.rating) : "",
      price_range: s.price_range || "",
      map_url: s.map_url || "",
      website_url: s.website_url || "",
      tags: Array.isArray(s.tags) ? s.tags.join(", ") : "",
    });
    setShowForm(true);
  }

  async function onSave() {
    const data = {
      ...form,
      hotel_id: Number(form.hotel_id),
      rating: form.rating ? Number(form.rating) : null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : null,
    };

    try {
      if (editing) {
        await adminApi.updateNearbyService(editing.id, data);
        toast.success("Đã cập nhật dịch vụ");
      } else {
        await adminApi.createNearbyService(data);
        toast.success("Đã tạo dịch vụ mới");
      }
      setShowForm(false);
      fetchServices();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Xoá dịch vụ này?")) return;
    try {
      await adminApi.deleteNearbyService(id);
      toast.success("Đã xoá");
      fetchServices();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Dịch vụ lân cận</h1>
        <Button variant="primary" onClick={openCreate}>+ Thêm dịch vụ</Button>
      </div>

      {/* Filters */}
      <Card className="p-3 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Khách sạn</label>
            <select
              value={filterHotelId}
              onChange={e => { setFilterHotelId(e.target.value); setPage(1); }}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2] min-w-[200px]"
            >
              <option value="">Tất cả</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Loại</label>
            <select
              value={filterCategory}
              onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]"
            >
              <option value="">Tất cả</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="text-xs text-slate-500 self-center">
            Tổng: <strong>{total}</strong> dịch vụ
          </div>
        </div>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">{editing ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Khách sạn *</label>
              <select
                value={form.hotel_id}
                onChange={e => setForm({ ...form, hotel_id: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]"
              >
                <option value="">-- Chọn khách sạn --</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Loại dịch vụ *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Input placeholder="Tên dịch vụ *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <textarea
                placeholder="Mô tả"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]"
              />
            </div>
            <Input placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Khoảng cách (VD: 200m, 1.5km)" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            <Input placeholder="Rating (0-5)" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            <Input placeholder="Khoảng giá (VD: 50.000 - 200.000₫)" value={form.price_range} onChange={e => setForm({ ...form, price_range: e.target.value })} />
            <Input placeholder="Link Google Maps" value={form.map_url} onChange={e => setForm({ ...form, map_url: e.target.value })} />
            <Input placeholder="Link Website" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} />
            <div className="md:col-span-2">
              <Input placeholder="Tags (phân cách bằng dấu phẩy: cafe, view đẹp, wifi)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={onSave}>Lưu</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Huỷ</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      {loading ? <Spinner text="Đang tải..." /> : (
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Khách sạn</th>
                  <th className="py-2 pr-2">Loại</th>
                  <th className="py-2 pr-2">Tên</th>
                  <th className="py-2 pr-2">Khoảng cách</th>
                  <th className="py-2 pr-2 text-right">Rating</th>
                  <th className="py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map(s => {
                  const catMeta = CATEGORIES.find(c => c.value === s.category);
                  return (
                    <tr key={s.id}>
                      <td className="py-2 pr-2 text-slate-500">{s.id}</td>
                      <td className="py-2 pr-2 text-slate-700 max-w-[150px] truncate" title={s.hotel_name}>{s.hotel_name}</td>
                      <td className="py-2 pr-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {catMeta ? catMeta.label : s.category}
                        </span>
                      </td>
                      <td className="py-2 pr-2 font-semibold text-slate-900 max-w-[200px] truncate">{s.name}</td>
                      <td className="py-2 pr-2 text-slate-500">{s.distance || "-"}</td>
                      <td className="py-2 pr-2 text-right">{s.rating || "-"}</td>
                      <td className="py-2 text-right">
                        <div className="flex gap-1 justify-end">
                          {s.map_url && (
                            <a href={s.map_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">🗺️</a>
                          )}
                          <button onClick={() => openEdit(s)} className="text-xs text-[#0071c2] hover:underline">Sửa</button>
                          <button onClick={() => onDelete(s.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {services.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-400">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-md text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                ←
              </button>
              <span className="text-sm text-slate-600">Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-md text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                →
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
