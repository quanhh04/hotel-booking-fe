import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const returnTo = useMemo(() => sp.get("returnTo") || "/", [sp]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const res = register({ name, email, password });
    if (!res.ok) return setErr(res.message);

    navigate(returnTo, { replace: true });
  }

  return (
    <Container className="py-8">
      <div className="max-w-md mx-auto">
        <Card className="p-5">
          <h1 className="text-xl font-extrabold text-slate-900">Đăng ký</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tạo tài khoản để đặt phòng và xem lịch sử đặt.
          </p>

          {err && (
            <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Họ và tên</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="VD: Trần Anh Tú"
              />
            </div>

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

            <Button variant="primary" className="w-full h-11" type="submit">
              Tạo tài khoản
            </Button>

          </form>

          <div className="mt-4 text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              className="text-[#0071c2] font-semibold hover:underline"
              to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            >
              Đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}
