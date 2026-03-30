import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const toast = useToast();

  const returnTo = useMemo(() => sp.get("returnTo") || "/", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (error) {
      toast.error(error.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-8">
      <div className="max-w-md mx-auto">
        <Card className="p-5">
          <h1 className="text-xl font-extrabold text-slate-900">Đăng nhập</h1>
          <p className="text-sm text-slate-600 mt-1">
            Bạn cần đăng nhập để đặt phòng.
          </p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Mật khẩu</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button
              variant="primary"
              className="w-full h-11"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <Link to="/forgot-password" className="text-[#0071c2] hover:underline">Quên mật khẩu?</Link>
            <span>Chưa có tài khoản?{" "}
            <Link
              className="text-[#0071c2] font-semibold hover:underline"
              to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
            >
              Đăng ký
            </Link></span>
          </div>
        </Card>
      </div>
    </Container>
  );
}
