import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { ToastProvider } from "./contexts/ToastProvider.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ForbiddenPage from "./pages/ForbiddenPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NewTransactionPage from "./pages/NewTransactionPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import WalletsPage from "./pages/WalletsPage.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";
import OwnerRoute from "./routes/OwnerRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route element={<OwnerRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route
                  path="/transactions/new"
                  element={<NewTransactionPage />}
                />
                <Route path="/wallets" element={<WalletsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
