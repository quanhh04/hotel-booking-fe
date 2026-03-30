import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { formatDateTime } from "../../utils/format";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(page, 20);
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Spinner text="Đang tải..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Người dùng ({total})</h1>
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Email</th>
              <th className="py-2">Tên</th>
              <th className="py-2">SĐT</th>
              <th className="py-2">Role</th>
              <th className="py-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id}>
                <td className="py-2 text-slate-500">{u.id}</td>
                <td className="py-2 font-semibold text-slate-900">{u.email}</td>
                <td className="py-2">{u.display_name || "-"}</td>
                <td className="py-2">{u.phone || "-"}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{u.role}</span>
                </td>
                <td className="py-2 text-xs text-slate-500">{formatDateTime(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex gap-2 mt-3 justify-center">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">← Trước</button>
        <span className="text-sm py-1">Trang {page}</span>
        <button disabled={users.length < 20} onClick={() => setPage(p => p + 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">Sau →</button>
      </div>
    </div>
  );
}
