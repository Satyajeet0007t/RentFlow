import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  History,
  Bell,
  Wrench,
  User,
  BookOpen,
} from "lucide-react";

export default function Navbar({
  onNavigateDashboard,
  onNavigatePayments,
  onNavigateTenants,
  onNavigateMaintenance,
  onNavigateBooking,
  onNavigateProfile,
  currentPage,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      action: onNavigateDashboard,
    },
    {
      id: "history",
      label: "Payments",
      icon: History,
      action: onNavigatePayments,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: BookOpen,
      action: () => onNavigateBooking(null),
    },
    {
      id: "maintenance",
      label: "Service",
      icon: Wrench,
      action: onNavigateMaintenance,
    },
    { id: "notices", label: "Notices", icon: Bell, action: onNavigateTenants },
  ];

  // Smart Scroll Logic
  useEffect(() => {
    const controlNavbar = () => {
      // Show navbar if scrolling up or if at the very top
      if (window.scrollY < lastScrollY || window.scrollY < 50) {
        setIsVisible(true);
      }
      // Hide navbar if scrolling down
      else if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center p-6 pointer-events-none transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* The Capsule Container */}
      <div className="pointer-events-auto flex items-center gap-2 md:gap-4 px-6 py-3 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* RF Logo */}
        <div
          className="text-xl font-black tracking-tighter italic px-4 cursor-pointer hover:text-blue-500 transition-colors"
          onClick={onNavigateDashboard}
        >
          R<span className="text-blue-500 font-normal">F</span>
        </div>

        {/* Navigation Items with Hover Labels */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`group relative flex items-center gap-0 hover:gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
                currentPage === item.id
                  ? "bg-blue-600/20 text-blue-500"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                size={18}
                strokeWidth={currentPage === item.id ? 2.5 : 2}
              />

              {/* The Hover Label: Hidden by default, expands on hover */}
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group-hover:max-w-[100px]">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {currentPage === item.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
              )}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-2" />

        {/* Profile Action */}
        <button
          onClick={onNavigateProfile}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            currentPage === "profile"
              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <User size={18} />
        </button>
      </div>
    </nav>
  );
}
