import { useState } from "react";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { authApi } from "../../api/authApi";

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.display_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  async function onSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ display_name: name, phone });
      toast.success("Đã cập nhật thông tin");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (!oldPw || !newPw) { toast.error("Vui lòng nhập đầy đủ"); return; }
    setChangingPw(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      toast.success("Đã đổi mật khẩu");
      setOldPw(""); setNewPw("");
    } catch (err) { toast.error(err.message); }
    finally { setChangingPw(false); }
  }

  return (
    <Container className="py-6">
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Tài khoản của tôi</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Thông tin cá nhân</h2>
          <form onSubmit={onSaveProfile} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Họ và tên</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
            </div>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Đổi mật khẩu</h2>
          <form onSubmit={onChangePassword} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Mật khẩu hiện tại</label>
              <Input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Mật khẩu mới</label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" />
            </div>
            <Button variant="primary" type="submit" disabled={changingPw}>
              {changingPw ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
