import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AiChatWidget from "../shared/AiChatWidget";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>
      <Footer />
      <AiChatWidget />
    </div>
  );
}
