import { RouterProvider } from "react-router-dom";
import { router } from "./components/router/index.jsx";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
