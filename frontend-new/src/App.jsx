import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Profile from "./pages/profile";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";

import AdminUsers from "./pages/admin/AdminUsers";

import AdminPlaces from "./pages/admin/AdminPlaces";
import PromoManagement from "./pages/PromoManagement";

import BusSearch from "./pages/bus/Search";
import BusResults from "./pages/bus/Results";
import BusSeats from "./pages/bus/Seats";
import BusCheckout from "./pages/bus/Checkout";
import BusBookings from "./pages/bus/Bookings";
import BusTicket from "./pages/bus/Ticket";

import FlightSearch from "./pages/FlightSearch";
import FlightResults from "./pages/FlightResults";
import FlightCheckout from "./pages/FlightCheckout";
import FlightTicket from "./pages/FlightTicket";
import FlightBookings from "./pages/FlightBookings";

import TrainSearch from "./pages/TrainSearch";
import TrainResults from "./pages/TrainResults";
import TrainCheckout from "./pages/TrainCheckout";
import TrainTicket from "./pages/TrainTicket";
import TrainBookings from "./pages/TrainBookings";

import AdminBookings from "./components/admin/AdminBookings";

// Các giao diện quản trị bổ sung
import PaymentRefundManagement from "./features/admin/operations/PaymentRefundManagement";
import PartnerManagement from "./features/admin/operations/PartnerManagement";
import HomeContentManagement from "./features/admin/content/HomeContentManagement";
import SystemReports from "./features/admin/operations/SystemReports";
import CustomerSupportManagement from "./features/admin/operations/CustomerSupportManagement";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            {/* Quản lý địa điểm */}
            <Route path="places" element={<AdminPlaces />} />

            {/* Quản lý khuyến mãi */}
            <Route path="promotions" element={<PromoManagement />} />

            {/* Quản lý người dùng */}
            <Route path="users" element={<AdminUsers />} />

            {/* Quản lý AI */}
            <Route path="ai" element={<AdminPlaceholder />} />

            {/* Các phân hệ quản trị bổ sung */}
            <Route path="payment" element={<PaymentRefundManagement />} />
            <Route path="suppliers" element={<PartnerManagement />} />
            <Route path="home-content" element={<HomeContentManagement />} />
            <Route path="reports" element={<SystemReports />} />
            <Route path="support" element={<CustomerSupportManagement />} />

            {/* Quản lý đặt vé */}
            <Route path="bookings" element={<Navigate to="bus" replace />} />

            <Route path="bookings/:transportType" element={<AdminBookings />} />
          </Route>
        </Route>
        {/* Đặt vé xe khách */}
        <Route path="/bus" element={<Navigate to="/bus/search" replace />} />
        <Route path="/bus/search" element={<BusSearch />} />
        <Route path="/bus/results" element={<BusResults />} />
        <Route path="/bus/trips/:tripId/seats" element={<BusSeats />} />
        <Route path="/bus/checkout" element={<BusCheckout />} />
        <Route path="/bus/bookings" element={<BusBookings />} />
        <Route path="/bus/bookings/:bookingCode" element={<BusTicket />} />

        {/* Đặt vé máy bay */}
        <Route
          path="/flight"
          element={<Navigate to="/flight/search" replace />}
        />
        <Route path="/flight/search" element={<FlightSearch />} />
        <Route path="/flight/results" element={<FlightResults />} />
        <Route path="/flight/checkout" element={<FlightCheckout />} />
        <Route path="/flight/ticket/:bookingCode" element={<FlightTicket />} />
        <Route path="/flight/bookings" element={<FlightBookings />} />

        {/* Đặt vé tàu hỏa */}
        <Route
          path="/train"
          element={<Navigate to="/train/search" replace />}
        />
        <Route path="/train/search" element={<TrainSearch />} />
        <Route path="/train/results" element={<TrainResults />} />
        <Route path="/train/checkout" element={<TrainCheckout />} />
        <Route path="/train/ticket/:bookingCode" element={<TrainTicket />} />
        <Route path="/train/bookings" element={<TrainBookings />} />

        {/* Route không tồn tại */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
