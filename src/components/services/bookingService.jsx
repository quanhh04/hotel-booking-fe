const LS_BOOKINGS = "bk_bookings";

function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

export function getAllBookings() {
  return safeParse(localStorage.getItem(LS_BOOKINGS), []);
}

export function saveAllBookings(list) {
  localStorage.setItem(LS_BOOKINGS, JSON.stringify(list));
}

export function getBookingsByUser(userId) {
  return getAllBookings().filter((b) => b.userId === userId);
}

export function cancelBooking(bookingId, userId) {
  const list = getAllBookings();
  const idx = list.findIndex((b) => b.id === bookingId && b.userId === userId);
  if (idx === -1) return null;

  if (list[idx].status === "CANCELLED") return list[idx];

  list[idx] = {
    ...list[idx],
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
  };
  saveAllBookings(list);
  return list[idx];
}