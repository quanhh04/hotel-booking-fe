import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const returnTo = useMemo(() => sp.get("returnTo") || "/", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (error) {
      setErr(error.message || "Email hoặc mật khẩu không đúng");
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

          {err && (
            <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
              {err}
            </div>
          )}

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

          <div className="mt-4 text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              className="text-[#0071c2] font-semibold hover:underline"
              to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
            >
              Đăng ký
            </Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}
