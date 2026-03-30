import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useToast } from "../../contexts/ToastContext";
import httpClient from "../../api/httpClient";
import { API_PATHS } from "../../utils/constants";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { toast.error("Vui lòng nhập email"); return; }
    setLoading(true);
    try {
      await httpClient.post(API_PATHS.AUTH_FORGOT_PASSWORD, { email: email.trim() });
      setSent(true);
      toast.success("Đã gửi email khôi phục mật khẩu");
    } catch (err) {
      toast.error(err.message || "Không thể gửi email");
    } finally { setLoading(false); }
  }

  return (
    <Container className="py-8">
      <div className="max-w-md mx-auto">
        <Card className="p-5">
          <h1 className="text-xl font-extrabold text-slate-900">Quên mật khẩu</h1>
          {sent ? (
            <div className="mt-4">
              <div className="text-sm text-slate-700">Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư.</div>
              <div className="mt-4">
                <Link to="/login"><Button variant="primary" className="w-full">Quay lại đăng nhập</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mt-1">Nhập email để nhận link khôi phục mật khẩu.</p>
              <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" required />
                <Button variant="primary" className="w-full h-11" type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi email khôi phục"}
                </Button>
              </form>
              <div className="mt-4 text-sm text-slate-600">
                <Link to="/login" className="text-[#0071c2] font-semibold hover:underline">← Quay lại đăng nhập</Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </Container>
  );
}
