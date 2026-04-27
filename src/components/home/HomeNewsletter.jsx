import { useState } from "react";
import Container from "../ui/Container";
import Input from "../ui/Input";
import Button from "../ui/Button";

/**
 * Form đăng ký nhận email ưu đãi (chỉ là demo, chưa gọi API).
 * Validate đơn giản bằng regex email.
 */
export default function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function onSubscribe(e) {
    e.preventDefault();
    setMsg("");

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValidEmail) {
      setMsg("Email chưa đúng định dạng.");
      return;
    }

    setMsg("Đã đăng ký nhận ưu đãi! 🎉");
    setEmail("");
  }

  return (
    <section className="bg-[#003580] text-white">
      <Container className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-2xl md:text-3xl font-extrabold">Tiết kiệm thời gian và tiền bạc!</div>
          <div className="mt-2 text-white/85">Đăng ký để nhận email ưu đãi và gợi ý du lịch.</div>
          <form onSubmit={onSubscribe} className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="h-12"
              />
              <Button type="submit" variant="primary" className="h-12 sm:w-40">Đăng ký</Button>
            </div>
            {msg && <div className="mt-3 text-sm text-white/90">{msg}</div>}
          </form>
        </div>
      </Container>
    </section>
  );
}
