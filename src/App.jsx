import { RouterProvider } from "react-router-dom";
import { router } from "./components/router/index.jsx";
import { AuthProvider } from "./components/auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
