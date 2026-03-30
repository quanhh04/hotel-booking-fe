import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { hotelApi } from "../../api/hotelApi";
import { formatVND } from "../../utils/format";
import { useToast } from "../../contexts/ToastContext";

export default function AdminRooms() {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterHotel, setFilterHotel] = useState("");
  const [form, setForm] = useState({ hotel_id: "", name: "", price_per_night: "", max_guests: "2", description: "", bed: "", size: "", total_quantity: "10" });

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.getRooms({ limit: 200 }); setRooms(res.rooms || []); }
    catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchHotels = useCallback(async () => {
    try { const res = await hotelApi.getHotels({ limit: 100 }); setHotels(res.hotels || []); }
    catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchRooms(); fetchHotels(); }, [fetchRooms, fetchHotels]);

  const filteredRooms = useMemo(() => {
    if (!filterHotel) return rooms;
    return rooms.filter(r => String(r.hotel_id) === filterHotel);
  }, [rooms, filterHotel]);

  function openCreate() {
    setEditing(null);
    setForm({ hotel_id: filterHotel || "", name: "", price_per_night: "", max_guests: "2", description: "", bed: "", size: "", total_quantity: "10" });
    setShowForm(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ hotel_id: String(r.hotel_id), name: r.name, price_per_night: String(r.price_per_night), max_guests: String(r.max_guests), description: r.description || "", bed: r.bed || "", size: r.size || "", total_quantity: String(r.total_quantity || 10) });
    setShowForm(true);
  }

  async function onSave() {
    const data = { ...form, hotel_id: Number(form.hotel_id), price_per_night: Number(form.price_per_night), max_guests: Number(form.max_guests), total_quantity: Number(form.total_quantity) };
    try {
      if (editing) { await adminApi.updateRoom(editing.id, data); toast.success("Đã cập nhật phòng"); }
      else { await adminApi.createRoom(data); toast.success("Đã tạo phòng mới"); }
      setShowForm(false); fetchRooms();
    } catch (err) { toast.error(err.message); }
  }

  async function onDelete(id) {
    if (!window.confirm("Xoá phòng này?")) return;
    try { await adminApi.deleteRoom(id); toast.success("Đã xoá"); fetchRooms(); }
    catch (err) { toast.error(err.message); }
  }

  async function onUpdateInventory(roomId, currentQty) {
    const newQty = window.prompt("Nhập số lượng phòng mới:", String(currentQty));
    if (newQty === null) return;
    const qty = Number(newQty);
    if (!Number.isFinite(qty) || qty < 0) { toast.error("Số lượng không hợp lệ"); return; }
    try {
      await adminApi.updateInventory(roomId, { total_quantity: qty });
      toast.success("Đã cập nhật số lượng");
      fetchRooms();
    } catch (err) { toast.error(err.message); }
  }

  if (loading) return <Spinner text="Đang tải..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Quản lý phòng ({filteredRooms.length})</h1>
        <Button variant="primary" onClick={openCreate}>+ Thêm phòng</Button>
      </div>

      {/* Filter by hotel */}
      <Card className="p-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Lọc theo khách sạn:</span>
          <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#0071c2]">
            <option value="">Tất cả</option>
            {hotels.map(h => <option key={h.id} value={String(h.id)}>{h.name}</option>)}
          </select>
        </div>
      </Card>

      {showForm && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">{editing ? "Sửa phòng" : "Thêm phòng"}</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Khách sạn</label>
              <select value={form.hotel_id} onChange={e => setForm({ ...form, hotel_id: e.target.value })}
                className="w-full mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]">
                <option value="">-- Chọn khách sạn --</option>
                {hotels.map(h => <option key={h.id} value={String(h.id)}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tên phòng</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Giá/đêm (VND)</label>
              <Input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Số khách tối đa</label>
              <Input type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Loại giường</label>
              <Input value={form.bed} onChange={e => setForm({ ...form, bed: e.target.value })} className="mt-1" placeholder="VD: 1 giường king" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Diện tích</label>
              <Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="mt-1" placeholder="VD: 32 m²" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Số lượng phòng</label>
              <Input type="number" value={form.total_quantity} onChange={e => setForm({ ...form, total_quantity: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div className="mt-2">
            <label className="text-xs font-semibold text-slate-600">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]" />
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" onClick={onSave}>Lưu</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Huỷ</Button>
          </div>
        </Card>
      )}

      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Khách sạn</th>
              <th className="py-2">Tên phòng</th>
              <th className="py-2">Giường</th>
              <th className="py-2">Diện tích</th>
              <th className="py-2 text-right">Giá/đêm</th>
              <th className="py-2 text-right">Khách</th>
              <th className="py-2 text-right">SL phòng</th>
              <th className="py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRooms.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-2 text-slate-500">{r.id}</td>
                <td className="py-2">
                  <div className="font-semibold text-slate-900">{r.hotel_name || `Hotel #${r.hotel_id}`}</div>
                  {r.hotel_address && <div className="text-xs text-slate-500 truncate max-w-[200px]">{r.hotel_address}</div>}
                </td>
                <td className="py-2 font-semibold text-slate-900">{r.name}</td>
                <td className="py-2 text-slate-600">{r.bed || "-"}</td>
                <td className="py-2 text-slate-600">{r.size || "-"}</td>
                <td className="py-2 text-right font-semibold">{formatVND(r.price_per_night)}</td>
                <td className="py-2 text-right">{r.max_guests}</td>
                <td className="py-2 text-right">{r.total_quantity || "-"}</td>
                <td className="py-2 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => onUpdateInventory(r.id, r.total_quantity || 0)} className="text-xs text-green-600 hover:underline">📦 SL</button>
                    <button onClick={() => openEdit(r)} className="text-xs text-[#0071c2] hover:underline">Sửa</button>
                    <button onClick={() => onDelete(r.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRooms.length === 0 && (
              <tr><td colSpan={9} className="py-6 text-center text-slate-500">Không có phòng nào</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
