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

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/hotels", element: <Hotels /> },
      { path: "/hotels/:id", element: <HotelDetail /> },

      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

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
    ],
  },
]);

