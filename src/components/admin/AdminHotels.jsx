import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { hotelApi } from "../../api/hotelApi";
import { adminApi } from "../../api/adminApi";
import { formatVND } from "../../utils/format";
import { useToast } from "../../contexts/ToastContext";
import { uploadImage } from "../../utils/upload";

function ImageManager({ hotelId, onClose }) {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getHotelImages(hotelId);
      setImages(res.images || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [hotelId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function onFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        // 1. Upload to Cloudinary
        const url = await uploadImage(file);
        // 2. Save to settings.images
        const img = await adminApi.createImage(url, file.name, 'hotel');
        // 3. Map to hotel
        await adminApi.addHotelImage(hotelId, img.id, images.length);
      }
      toast.success(`Đã upload ${files.length} ảnh`);
      fetch();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function onRemove(imageId) {
    try {
      await adminApi.removeHotelImage(hotelId, imageId);
      toast.success("Đã gỡ ảnh");
      fetch();
    } catch (err) { toast.error(err.message); }
  }

  return (
    <Card className="p-4 mb-4 border-2 border-[#0071c2]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900">🖼️ Quản lý ảnh — Hotel #{hotelId}</h2>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-900">✕ Đóng</button>
      </div>

      {loading ? <Spinner text="Đang tải ảnh..." /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.alt || ""} className="h-24 w-full rounded-md object-cover" />
                <button onClick={() => onRemove(img.id)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
              </div>
            ))}
            {images.length === 0 && <div className="col-span-4 text-sm text-slate-500 py-4 text-center">Chưa có ảnh</div>}
          </div>

          <div className="flex gap-2">
            <label className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer transition ${uploading ? "bg-slate-200 text-slate-400" : "bg-green-600 text-white hover:bg-green-700"}`}>
              {uploading ? "Đang upload..." : "📁 Chọn ảnh"}
              <input type="file" accept="image/*" multiple onChange={onFileUpload} disabled={uploading} className="hidden" />
            </label>
            <span className="text-xs text-slate-400 self-center">Chọn 1 hoặc nhiều ảnh từ máy tính</span>
          </div>
        </>
      )}
    </Card>
  );
}

export default function AdminHotels() {
  const toast = useToast();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", description: "" });
  const [imageHotelId, setImageHotelId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const res = await hotelApi.getHotels({ limit: 100 }); setHotels(res.hotels || []); }
    catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  function openCreate() { setEditing(null); setForm({ name: "", address: "", description: "" }); setShowForm(true); }
  function openEdit(h) { setEditing(h); setForm({ name: h.name, address: h.address, description: h.description || "" }); setShowForm(true); }

  async function onSave() {
    try {
      if (editing) { await adminApi.updateHotel(editing.id, form); toast.success("Đã cập nhật"); }
      else { await adminApi.createHotel(form); toast.success("Đã tạo khách sạn mới"); }
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.message); }
  }

  async function onDelete(id) {
    if (!window.confirm("Xoá khách sạn này?")) return;
    try { await adminApi.deleteHotel(id); toast.success("Đã xoá"); fetch(); }
    catch (err) { toast.error(err.message); }
  }

  if (loading) return <Spinner text="Đang tải..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Quản lý khách sạn</h1>
        <Button variant="primary" onClick={openCreate}>+ Thêm khách sạn</Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">{editing ? "Sửa khách sạn" : "Thêm khách sạn"}</h2>
          <div className="space-y-2">
            <Input placeholder="Tên khách sạn" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <textarea placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2]" />
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" onClick={onSave}>Lưu</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Huỷ</Button>
          </div>
        </Card>
      )}

      {imageHotelId && <ImageManager hotelId={imageHotelId} onClose={() => setImageHotelId(null)} />}

      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Tên</th>
              <th className="py-2">Địa chỉ</th>
              <th className="py-2 text-right">Rating</th>
              <th className="py-2 text-right">Giá từ</th>
              <th className="py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hotels.map(h => (
              <tr key={h.id}>
                <td className="py-2 text-slate-500">{h.id}</td>
                <td className="py-2 font-semibold text-slate-900">{h.name}</td>
                <td className="py-2 text-slate-600 max-w-xs truncate">{h.address}</td>
                <td className="py-2 text-right">{h.rating || "-"}</td>
                <td className="py-2 text-right">{h.price_from ? formatVND(h.price_from) : "-"}</td>
                <td className="py-2 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setImageHotelId(h.id)} className="text-xs text-green-600 hover:underline">🖼️ Ảnh</button>
                    <button onClick={() => openEdit(h)} className="text-xs text-[#0071c2] hover:underline">Sửa</button>
                    <button onClick={() => onDelete(h.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
