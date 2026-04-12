import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./components/pages/Home";
import Hotels from "./components/pages/Hotels";
import HotelDetail from "./components/pages/HotelDetail";
import Booking from "./components/pages/Booking";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import RequireAuth from "./components/layout/RequireAuth";
import MyBookings from "./components/pages/MyBookings";
import Profile from "./components/pages/Profile";
import MyReviews from "./components/pages/MyReviews";
import ForgotPassword from "./components/pages/ForgotPassword";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import AdminHotels from "./components/admin/AdminHotels";
import AdminRooms from "./components/admin/AdminRooms";
import AdminBookings from "./components/admin/AdminBookings";
import AdminUsers from "./components/admin/AdminUsers";
import AdminCities from "./components/admin/AdminCities";
import AdminPayments from "./components/admin/AdminPayments";
import AdminReviews from "./components/admin/AdminReviews";

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
    ],
  },
]);

