import { Link, NavLink, useLocation } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

  return (
    <header className="bg-[#003580] text-white">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-lg font-extrabold tracking-wide">
            Booking<span className="text-[#febb02]">VN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-semibold ${
                  isActive ? "bg-white/10" : "hover:bg-white/10"
                }`
              }
            >
              Lưu trú
            </NavLink>

            <a href="#" className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-white/10">
              Chuyến bay
            </a>

            <a href="#" className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-white/10">
              Thuê xe
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link to={`/register?returnTo=${returnTo}`}>
                  <Button variant="secondary" className="bg-white text-[#003580] border-white">
                    Đăng ký
                  </Button>
                </Link>

                <Link to={`/login?returnTo=${returnTo}`}>
                  <Button variant="secondary" className="bg-white text-[#003580] border-white">
                    Đăng nhập
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <span className="hidden md:inline text-sm text-white/90">
                  Xin chào, <b>{user.name}</b>
                </span>

                <Link to="/me/bookings">
                  <Button variant="secondary" className="bg-white text-[#003580] border-white">
                    Đặt phòng của tôi
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  className="bg-white text-[#003580] border-white"
                  onClick={logout}
                >
                  Đăng xuất
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}