const LS_REVIEWS = "bk_reviews";
const LS_BOOKINGS = "bk_bookings";

function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function getAllReviews() {
  return safeParse(localStorage.getItem(LS_REVIEWS), []);
}

function saveAllReviews(list) {
  localStorage.setItem(LS_REVIEWS, JSON.stringify(list));
}

export function getReviewsByHotel(hotelId) {
  return getAllReviews()
    .filter((r) => String(r.hotelId) === String(hotelId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserReview(hotelId, userId) {
  return getAllReviews().find(
    (r) => String(r.hotelId) === String(hotelId) && String(r.userId) === String(userId)
  );
}

export function upsertReview({ hotelId, userId, userName, rating, comment }) {
  const list = getAllReviews();
  const existingIdx = list.findIndex(
    (r) => String(r.hotelId) === String(hotelId) && String(r.userId) === String(userId)
  );

  const now = new Date().toISOString();
  const payload = {
    id: existingIdx >= 0 ? list[existingIdx].id : (globalThis.crypto?.randomUUID?.() || String(Date.now())),
    hotelId,
    userId,
    userName,
    rating: Number(rating),
    comment: String(comment || "").trim(),
    createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) list[existingIdx] = payload;
  else list.unshift(payload);

  saveAllReviews(list);
  return payload;
}

// ✅ check điều kiện được review: đã có booking CONFIRMED với hotelId
export function canUserReviewHotel(hotelId, userId) {
  const bookings = safeParse(localStorage.getItem(LS_BOOKINGS), []);
  return bookings.some(
    (b) =>
      String(b.hotelId) === String(hotelId) &&
      String(b.userId) === String(userId) &&
      String(b.status) === "CONFIRMED"
  );
}

export function calcReviewStats(reviews) {
  const count = reviews.length;
  if (!count) return { count: 0, avg: 0 };

  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avg = Math.round((sum / count) * 10) / 10; // 1 decimal
  return { count, avg };
}