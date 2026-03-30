import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import Home from "../pages/Home";
import Hotels from "../pages/Hotels";
import HotelDetail from "../pages/HotelDetail";
import Booking from "../pages/Booking";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RequireAuth from "../auth/RequireAuth";
import MyBookings from "../pages/MyBookings";
import Profile from "../pages/Profile";
import MyReviews from "../pages/MyReviews";
import ForgotPassword from "../pages/ForgotPassword";
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/Dashboard";
import AdminHotels from "../admin/AdminHotels";
import AdminRooms from "../admin/AdminRooms";
import AdminBookings from "../admin/AdminBookings";
import AdminUsers from "../admin/AdminUsers";
import AdminCities from "../admin/AdminCities";
import AdminPayments from "../admin/AdminPayments";
import AdminReviews from "../admin/AdminReviews";
import AdminAiStats from "../admin/AdminAiStats";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/hotels", element: <Hotels /> },
      { path: "/hotels/:id", element: <HotelDetail /> },

      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },

      {
        path: "/booking/:id",
        element: (
          <RequireAuth>
            <Booking />
          </RequireAuth>
        ),
      },

      {
        path: "/me/bookings",
        element: (
          <RequireAuth>
            <MyBookings />
          </RequireAuth>
        ),
      },

      {
        path: "/me/profile",
        element: <RequireAuth><Profile /></RequireAuth>,
      },

      {
        path: "/me/reviews",
        element: <RequireAuth><MyReviews /></RequireAuth>,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "hotels", element: <AdminHotels /> },
      { path: "rooms", element: <AdminRooms /> },
      { path: "bookings", element: <AdminBookings /> },
      { path: "users", element: <AdminUsers /> },
      { path: "cities", element: <AdminCities /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "ai-stats", element: <AdminAiStats /> },
    ],
  },
]);

