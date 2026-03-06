import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} Booking</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900">Điều khoản</a>
            <a href="#" className="hover:text-slate-900">Chính sách</a>
            <a href="#" className="hover:text-slate-900">Liên hệ</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
