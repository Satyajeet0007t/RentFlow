import React from "react";
import "./theme.css";
import { RefreshCcw } from "lucide-react";
import { usePropertyData } from "./hooks/usePropertyData";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// Components
import Navbar from "./components/layout/Navbar";
import BentoGrid from "./components/dashboard/BentoGrid";
import PropertyCard from "./components/dashboard/PropertyCard";
import RentHistory from "./components/dashboard/RentHistory";
import NoticeBoard from "./components/dashboard/NoticeBoard";
import MaintenanceHub from "./components/dashboard/MaintenanceHub";
import BookingHub from "./components/dashboard/BookingHub";
import Profile from "./components/dashboard/Profile";
import AboutCarousel from "./components/dashboard/AboutCarousel";
import UpdateStatusModal from "./components/dashboard/UpdateStatusModal";
import Login from "./components/dashboard/Login";
import MagicCursor from "./components/layout/MagicCursor";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("userRole");

  // Create a helper object so your existing button code doesn't break
  const user = role ? { role: role } : null;
  // Add this line
  const isManager = user?.role?.toLowerCase() === "manager";

  console.log("Detected Role from Storage:", role);

  const {
    isModalOpen,
    setIsModalOpen,
    wingStats,
    totalVacancy,
    handleUpdateWing,
    selectedWingContext,
  } = usePropertyData();

  const currentPath = location.pathname;

  // HIDE NAVBAR LOGIC: We don't want the navbar showing on the login screen
  const isLoginPage = currentPath === "/login";

  console.log("Full User Object:", user);
  console.log("Role Check:", user?.role);

  return (
    <div className="relative min-h-screen">
      <MagicCursor />

      {/* Only show Navbar if we are NOT on the login page */}
      {!isLoginPage && (
        <Navbar
          onNavigateDashboard={() => navigate("/")}
          onNavigatePayments={() => navigate("/payments")}
          onNavigateTenants={() => navigate("/notice")}
          onNavigateMaintenance={() => navigate("/services")}
          onNavigateBooking={(wingName) => {
            const target = wingName || null;
            navigate("/bookings", { state: { passedWing: target } });
          }}
          onNavigateProfile={() => navigate("/profile")}
          currentPage={
            currentPath === "/" ? "dashboard" : currentPath.substring(1)
          }
        />
      )}

      {/* DYNAMIC PADDING: Remove padding-top (pt-44) when on Login page */}
      <div className={isLoginPage ? "" : "pt-44"}>
        <Routes>
          {/* LOGIN ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD ROUTE */}
          <Route
            path="/"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <header className="mb-16 relative">
                  {/* Hero Background Glow */}
                  <div className="absolute -top-24 -left-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full" />

                  <h1 className="text-7xl md:text-8xl font-black tracking-tighter italic leading-none text-white">
                    RentFlow{" "}
                    <span className="text-blue-600 not-italic">OS</span>
                  </h1>
                  <p className="mt-4 text-slate-500 font-medium tracking-[0.2em] uppercase text-[10px]">
                    Premium Property Intelligence — Management Suite
                  </p>
                </header>

                <AboutCarousel />

                <BentoGrid
                  units={totalVacancy}
                  count={wingStats.length}
                  onViewHistory={() => navigate("/payments")}
                />

                <div className="mt-20 mb-12 flex justify-end">
                  <button
                    onClick={() => isManager && setIsModalOpen(true)}
                    disabled={!isManager}
                    className={`group flex items-center gap-4 px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all 
      ${
        isManager
          ? "bg-blue-600 text-white cursor-pointer shadow-[0_0_25px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:bg-blue-500 active:scale-95"
          : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 border border-slate-700"
      }`}
                  >
                    <RefreshCcw
                      size={16}
                      className={
                        isManager
                          ? "group-hover:rotate-180 transition-transform duration-700"
                          : ""
                      }
                    />
                    {isManager ? "Update Status" : "Status Locked"}
                  </button>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {wingStats.map((wing) => (
                    <PropertyCard
                      key={wing.id}
                      name={wing.id}
                      address="Luxury Residency, Pune"
                      bhkType={wing.bhk}
                      rentRange={wing.range}
                      vacancy={wing.vac}
                      onNavigateBooking={() =>
                        navigate("/bookings", {
                          state: { passedWing: wing.id },
                        })
                      }
                    />
                  ))}
                </section>
              </main>
            }
          />

          {/* OTHER ROUTES */}
          <Route
            path="/payments"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <RentHistory />
              </main>
            }
          />
          <Route
            path="/notice"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <NoticeBoard />
              </main>
            }
          />
          <Route
            path="/services"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <MaintenanceHub />
              </main>
            }
          />
          <Route
            path="/bookings"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20">
                <BookingHub
                  wingStats={wingStats}
                  initialWing={selectedWingContext}
                />
              </main>
            }
          />

          <Route
            path="/profile"
            element={
              <main className="max-w-7xl mx-auto px-6 pb-20 text-center">
                <Profile />
              </main>
            }
          />
        </Routes>
      </div>

      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateWing}
        wings={wingStats}
      />
    </div>
  );
}

export default App;
