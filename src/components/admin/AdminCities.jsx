import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../contexts/ToastContext";
import { uploadImage } from "../../utils/upload";

export default function AdminCities() {
  const toast = useToast();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", subtitle: "" });
  const [thumbPreview, setThumbPreview] = useState("");
  const [thumbImageId, setThumbImageId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.getCities(50); setCities(res.cities || []); }
    catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", subtitle: "" });
    setThumbPreview(""); setThumbImageId(null);
    setShowForm(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name, subtitle: c.subtitle || "" });
    setThumbPreview(c.thumbnail || "");
    setThumbImageId(c.thumbnail_id || null);
    setShowForm(true);
  }

  async function onFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      const img = await adminApi.createImage(url, file.name, "city");
      setThumbPreview(url);
      setThumbImageId(img.id);
      toast.success("Đã upload ảnh");
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function onSave() {
    const data = { ...form };
    if (thumbImageId) data.thumbnail_id = thumbImageId;
    try {
      if (editing) { await adminApi.updateCity(editing.id, data); toast.success("Đã cập nhật"); }
      else { await adminApi.createCity(data); toast.success("Đã tạo thành phố mới"); }
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.message); }
  }

  async function onDelete(id) {
    if (!window.confirm("Xoá thành phố này?")) return;
    try { await adminApi.deleteCity(id); toast.success("Đã xoá"); fetch(); }
    catch (err) { toast.error(err.message); }
  }

  if (loading) return <Spinner text="Đang tải..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Quản lý thành phố</h1>
        <Button variant="primary" onClick={openCreate}>+ Thêm thành phố</Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">{editing ? "Sửa thành phố" : "Thêm thành phố"}</h2>
          <div className="space-y-2">
            <Input placeholder="Tên thành phố" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Subtitle (VD: Biển đẹp • Resort)" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Ảnh thumbnail</label>
              <div className="flex items-center gap-3">
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" />
                ) : (
                  <div className="h-20 w-32 rounded-md bg-slate-200 flex items-center justify-center text-slate-400 text-xs">Chưa có ảnh</div>
                )}
                <label className={`px-3 py-2 rounded-md text-sm font-semibold cursor-pointer transition ${uploading ? "bg-slate-200 text-slate-400" : "bg-green-600 text-white hover:bg-green-700"}`}>
                  {uploading ? "Đang upload..." : "📁 Chọn ảnh"}
                  <input type="file" accept="image/*" onChange={onFileUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" onClick={onSave}>Lưu</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Huỷ</Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Ảnh</th>
              <th className="py-2">Tên</th>
              <th className="py-2">Subtitle</th>
              <th className="py-2 text-right">Số KS</th>
              <th className="py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cities.map(c => (
              <tr key={c.id}>
                <td className="py-2 text-slate-500">{c.id}</td>
                <td className="py-2">{c.thumbnail ? <img src={c.thumbnail} className="h-8 w-12 rounded object-cover" alt="" /> : <div className="h-8 w-12 rounded bg-slate-200" />}</td>
                <td className="py-2 font-semibold text-slate-900">{c.name}</td>
                <td className="py-2 text-slate-600">{c.subtitle || "-"}</td>
                <td className="py-2 text-right">{c.hotel_count || 0}</td>
                <td className="py-2 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(c)} className="text-xs text-[#0071c2] hover:underline">Sửa</button>
                    <button onClick={() => onDelete(c.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
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
