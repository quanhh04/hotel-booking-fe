import { useEffect, useState } from 'react';

/**
 * useFetch — Hook GỌI API CHUNG cho mọi GET request.
 *
 * Vì sao có hook này?
 *   Trước đây mỗi resource (hotels, bookings, reviews,...) có 1 hook riêng,
 *   nhưng nội dung gần như y hệt: loading/error/data + useEffect + cancelled flag.
 *   Gom lại thành 1 hook → dễ giảng pattern, dễ bảo trì, ít trùng lặp.
 *
 * Cách dùng:
 *   const { data, loading, error, refetch } = useFetch(
 *     () => hotelApi.getHotels({ keyword: 'Đà Nẵng' }),  // hàm trả Promise
 *     [keyword]                                          // deps: khi nào fetch lại
 *   );
 *
 * Tham số:
 *   - apiCall: () => Promise — hàm gọi API.
 *   - deps: mảng dependency (giống useEffect). Đổi → fetch lại.
 *
 * Trả về:
 *   - data: kết quả từ API (null khi chưa có).
 *   - loading: true khi đang gọi.
 *   - error: chuỗi lỗi (null nếu thành công).
 *   - refetch: gọi để load lại thủ công.
 */
export function useFetch(apiCall, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // refreshKey để buộc useEffect chạy lại khi gọi refetch()
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Cờ "cancelled" tránh setState sau khi component đã unmount
    // hoặc deps đã đổi (kết quả cũ về sau, ta không muốn ghi đè kết quả mới).
    let cancelled = false;

    setLoading(true);
    setError(null);

    apiCall()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Đã có lỗi xảy ra'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshKey]);

  function refetch() {
    setRefreshKey((k) => k + 1);
  }

  return { data, loading, error, refetch };
}
