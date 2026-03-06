import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Container from "../ui/Container";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [sp] = useSearchParams();

    const returnTo = useMemo(() => sp.get("returnTo") || "/", [sp]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        setErr("");

        const res = login({ email, password });
        if (!res.ok) return setErr(res.message);

        navigate(returnTo, { replace: true });
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

                        <Button variant="primary" className="w-full h-11" type="submit">
                            Đăng nhập
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
