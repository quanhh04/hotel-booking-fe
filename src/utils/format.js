export function formatVND(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("vi-VN");
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("vi-VN");
}
