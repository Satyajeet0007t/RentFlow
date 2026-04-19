import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RevealContainer, RevealItem } from "./MotionWrapper";
import { motion } from "framer-motion";

import axios from "axios";
import {
  ShieldCheck,
  Home,
  CreditCard,
  Wrench,
  LogOut,
  Mail,
  Check,
  Clock,
  Zap,
  Megaphone,
  ArrowUpRight,
  Search,
} from "lucide-react";
import PageLayout from "../layout/PageLayout";

export default function Profile() {
  const navigate = useNavigate();

  // --- SECTION: STATE MANAGEMENT ---
  // Get data from localStorage (set during login)

  const savedWing =
    localStorage.getItem("userWing") || localStorage.getItem("wing") || "";
  const savedFlat =
    localStorage.getItem("userFlat") || localStorage.getItem("flatNo") || "";
  const savedEmail =
    localStorage.getItem("userEmail") || localStorage.getItem("email") || "";
  const savedRole =
    localStorage.getItem("userRole") ||
    localStorage.getItem("role") ||
    "resident";

  // 2. INITIALIZE STATE USING THE VARIABLES ABOVE
  const [selectedWing, setSelectedWing] = useState(savedWing);
  const [flatInput, setFlatInput] = useState(savedFlat);
  const [userEmail, setUserEmail] = useState(savedEmail);

  // Auto-search if we already have the resident's data
  const [isSearched, setIsSearched] = useState(!!(savedWing && savedFlat));
  const [role, setRole] = useState(
    savedRole === "manager" ? "manager" : "tenant",
  );
  const [requests, setRequests] = useState([]);

  const isLoggedIn = !!localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchRequests = async () => {
      // Use 'role' (which I see in your console log) instead of 'userRole'
      if (role === "manager") {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/login/reset-requests",
          );
          setRequests(res.data);
        } catch (err) {
          console.error("Manager fetch failed:", err);
        }
      }
    };
    fetchRequests();
  }, [role]);

  // 3. LOGIC & EFFECTS
  useEffect(() => {
    // This keeps the UI in sync if localStorage changes
    if (savedWing && savedFlat) {
      setSelectedWing(savedWing);
      setFlatInput(savedFlat);
      setIsSearched(true);
    }
  }, [savedWing, savedFlat]);

  useEffect(() => {
    // If a resident somehow tries to access the manager role, block them
    if (role === "manager") {
      console.log("Welcome, Administrator. Manager Console Activated.");
    } else {
      console.log("Resident Session. Manager Console Locked.");
    }
  }, [role]);

  const [data, setData] = useState({
    properties: [],
    maintenance: [],
    bookings: [],
    notices: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(true);

  // --- SECTION: DATA FETCHING ---
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [transRes, maintRes, bookRes, noticeRes, propRes] =
        await Promise.all([
          axios
            .get("http://localhost:5000/api/transactions")
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:5000/api/maintenance")
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:5000/api/bookings")
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:5000/api/notices")
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:5000/api/properties")
            .catch(() => ({ data: [] })),
        ]);

      setData({
        transactions: transRes.data ?? [],
        maintenance: maintRes.data ?? [],
        bookings: bookRes.data ?? [],
        notices: noticeRes.data ?? [],
        properties: propRes.data ?? [],
      });
    } catch (err) {
      console.error("System Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const properties = data.properties || [];
  const maintenance = data.maintenance || [];
  const transactions = data.transactions || [];
  const notices = data.notices || [];
  const bookings = data.bookings || [];

  // --- SECTION: UNIFIED SYSTEM LOGIC ---

  // 1. CORE DATA PREP & WING LIST (For Manager Dropdowns)
  const wingsList = [...new Set(properties.map((p) => p.wing))]
    .filter(Boolean)
    .sort();

  // 2. DYNAMIC SEARCH CONSTANTS
  // We use different sources based on the role to prevent naming conflicts
  const managerSearchWing = (selectedWing || "")
    .toString()
    .trim()
    .toUpperCase();
  const managerSearchFlat = (flatInput || "").toString().trim().toUpperCase();

  const residentSearchWing = (savedWing || selectedWing || "")
    .toString()
    .trim()
    .toUpperCase();
  const residentSearchFlat = (savedFlat || flatInput || "")
    .toString()
    .trim()
    .toUpperCase();

  const handleAdminResetPassword = async () => {
    // PROMPT 1
    const residentEmail = window.prompt(
      "Enter Resident Email to Reset Password:",
    );
    if (!residentEmail) return; // User clicked cancel

    // PROMPT 2
    const newPass = window.prompt(`Enter New Password for ${residentEmail}:`);
    if (!newPass) return; // User clicked cancel

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/login/admin-force-reset`,
        {
          email: residentEmail,
          newPassword: newPass,
        },
      );

      if (res.data.success) {
        alert("Password updated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Reset failed. Check if email exists.");
    }
  };

  const handleMarkAsDone = async (requestId, e) => {
    e.stopPropagation(); // Prevents the main card's onClick from firing
    try {
      const res = await axios.put(
        `http://localhost:5000/api/login/mark-done/${requestId}`,
      );
      if (res.data.success) {
        // Update local state to remove the item instantly
        setRequests((prev) => prev.filter((req) => req._id !== requestId));
      }
    } catch (err) {
      console.error("Failed to mark as done", err);
    }
  };

  // 3. FUZZY MATCH HELPER (For Manager Search Utility)
  const isMatch = (item) => {
    if (!item) return false;
    const normalize = (val) =>
      val
        ?.toString()
        .toUpperCase()
        .replace(/\s|WING|FLAT/g, "")
        .trim() || "";

    const itemWing = normalize(item.wing || item.Wing);
    const itemFlat = normalize(item.flatNo || item.flat_no || item.flat);

    return (
      itemWing === normalize(managerSearchWing) &&
      itemFlat === normalize(managerSearchFlat)
    );
  };

  // 4. MANAGER DASHBOARD LOGIC (Total Portfolio Analytics)
  const paidPayments = transactions.filter((t) => {
    const status = (t.status || t.paymentStatus || "").toLowerCase();
    return ["paid", "success", "completed"].includes(status);
  }).length;

  const pendingPayments = transactions.filter((t) => {
    const status = (t.status || t.paymentStatus || "").toLowerCase();
    return ["pending", "unpaid", "waiting"].includes(status);
  }).length;

  const complaints = maintenance.filter((m) => {
    const type = (m.type || m.category || "").toLowerCase();
    const status = (m.status || m.state || "").toLowerCase();
    return (
      (type.includes("complaint") || type.includes("issue")) &&
      ["open", "pending", "active"].includes(status)
    );
  }).length;

  const maintenanceTasks = maintenance.filter((m) => {
    const type = (m.type || m.category || "").toLowerCase();
    const status = (m.status || m.state || "").toLowerCase();
    return (
      !type.includes("complaint") &&
      ["open", "pending", "active", "in progress"].includes(status)
    );
  }).length;

  const waitingBookings = bookings.filter((b) => {
    const status = (b.status || b.state || "").toLowerCase();
    return ["waiting", "pending", "requested"].includes(status);
  }).length;

  const occupiedCount = properties.filter(
    (p) => Number(p.tenants) > 0 || p.isOccupied || p.status === "Occupied",
  ).length;

  const occupancyRate =
    properties.length > 0
      ? Math.round((occupiedCount / properties.length) * 100)
      : 0;

  const totalTenants = properties.reduce(
    (sum, p) => sum + (Number(p.tenants) || 0),
    0,
  );

  // 5. RESIDENT PORTAL LOGIC (Filtering by Saved Profile)

  const filterByResident = (item) => {
    if (!item) return false;

    // This helper removes spaces and the word "WING" to ensure "Wing E" matches "E"
    const clean = (val) =>
      val
        ?.toString()
        .toUpperCase()
        .replace(/\s|WING/g, "") // Removes spaces and the word "WING"
        .trim() || "";

    const userW = clean(savedWing || selectedWing);
    const userF = clean(savedFlat || flatInput);

    const itemW = clean(item.wing || item.Wing || item.sector);
    const itemF = clean(item.flatNo || item.flat || item.flat_no || item.unit);

    return itemW === userW && itemF === userF;
  };

  // Filtered arrays for the logged-in resident
  const myPayments = (transactions || []).filter(filterByResident);
  const myRequests = (maintenance || []).filter(filterByResident);

  // Count Pending (Unpaid)
  const myDuePaymentsCount = myPayments.filter((t) =>
    ["pending", "unpaid", "due"].includes(
      (t.status || t.paymentStatus || "").toLowerCase(),
    ),
  ).length;

  // Count Paid (Success)
  const myClearedPaymentsCount = myPayments.filter((t) =>
    ["paid", "success", "completed"].includes(
      (t.status || t.paymentStatus || "").toLowerCase(),
    ),
  ).length;

  // Count Active Service Requests
  const pendingMyRequestsCount = myRequests.filter((m) =>
    ["open", "pending", "active", "in progress"].includes(
      (m.status || m.state || "").toLowerCase(),
    ),
  ).length;

  // --- LOADING STATE ---
  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-black">
        SYNCING TERMINAL...
      </div>
    );

  const handleLogout = () => {
    // 1. CLEAR EVERY TRACE OF THE SESSION
    localStorage.removeItem("userWing");
    localStorage.removeItem("userFlat");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");

    navigate(-1, { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <PageLayout
        title="System Profile"
        subtitle={`User Mode: ${role.toUpperCase()} • Access Verified`}
      >
        {/* --- TOP ACCESS BAR --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
        >
          {/* ROLE TOGGLE */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md relative overflow-hidden">
            {/* MANAGER CONSOLE BUTTON */}
            <button
              disabled={savedRole !== "manager"}
              onClick={() => setRole("manager")}
              className={`relative z-10 px-8 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 ${
                role === "manager"
                  ? "text-black"
                  : savedRole !== "manager"
                    ? "text-slate-700 cursor-not-allowed opacity-30"
                    : "text-slate-500 hover:text-white"
              }`}
            >
              {/* MAGNETIC SLIDER - This is the "high-end" trick */}
              {role === "manager" && (
                <motion.div
                  layoutId="roleSlider"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">
                {savedRole === "manager" ? "Manager Console" : "Console Locked"}
              </span>
            </button>

            {/* RESIDENT PORTAL BUTTON */}
            <button
              disabled={savedRole === "manager"}
              onClick={() => setRole("tenant")}
              className={`relative z-10 px-8 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 ${
                role === "tenant"
                  ? "text-white"
                  : savedRole === "manager"
                    ? "text-slate-700 cursor-not-allowed opacity-30"
                    : "text-slate-500 hover:text-white"
              }`}
            >
              {role === "tenant" && (
                <motion.div
                  layoutId="roleSlider"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">
                {savedRole === "manager"
                  ? "Portal Restricted"
                  : "Resident Portal"}
              </span>
            </button>
          </div>

          {/* UPGRADED TOP LOGIN PORTAL BUTTON */}
          <motion.button
            whileHover={!isLoggedIn ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isLoggedIn ? { scale: 0.98 } : {}}
            onClick={() => !isLoggedIn && navigate("/login")}
            disabled={isLoggedIn}
            className={`group relative px-6 py-2.5 rounded-xl border transition-all duration-500 overflow-hidden ${
              isLoggedIn
                ? "bg-slate-800/50 border-white/5 cursor-not-allowed opacity-60"
                : "bg-slate-900 border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            }`}
          >
            {/* Animated Glass Streak */}
            {!isLoggedIn && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            )}

            <div className="relative z-10 flex items-center gap-3">
              <div className="relative">
                <ShieldCheck
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isLoggedIn
                      ? "text-slate-500"
                      : "text-blue-500 group-hover:rotate-[360deg]"
                  }`}
                />
                {!isLoggedIn && (
                  <div className="absolute inset-0 bg-blue-500/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <span
                className={`font-black text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isLoggedIn
                    ? "text-slate-500"
                    : "text-blue-500 group-hover:text-white"
                }`}
              >
                {isLoggedIn ? "Session Active" : "Login Portal"}
              </span>

              {!isLoggedIn && (
                <div className="flex gap-1 ml-1">
                  <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                </div>
              )}
            </div>
          </motion.button>
        </motion.div>

        {role === "manager" ? (
          /* --- MANAGER CONSOLE (LOCKED & PRESERVED) --- */
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12, // Creates the 'ripple' effect from top to bottom
                  delayChildren: 0.1,
                },
              },
            }}
            className="space-y-8"
          >
            {/* --- MAIN ANALYTICS CARD --- */}
            <motion.div
              // 1. Add the perspective class to the parent
              className="perspective-1000 relative overflow-hidden bg-[#080808] border border-white/5 rounded-[3.5rem] p-12 shadow-2xl"
              // 2. Add the 3D tilt logic
              whileHover={{
                rotateX: 4,
                rotateY: -4,
                z: 20,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              // 3. Keep your existing entry animations
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Animated Background Glows */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-1000" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/5 blur-[100px] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">
                      System Intelligence
                    </span>
                  </div>
                  <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                    Portfolio
                    <br />
                    <span className="text-blue-600">Analytics</span>
                  </h1>
                </div>

                <div className="flex gap-12 border-l border-white/10 pl-12">
                  {/* Collection Efficiency */}
                  <div className="group/stat">
                    <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] mb-2 group-hover/stat:text-emerald-400 transition-colors">
                      Collection Efficiency
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black text-white italic tracking-tighter tabular-nums">
                        {transactions.length > 0
                          ? Math.round(
                              (paidPayments / transactions.length) * 100,
                            )
                          : 0}
                      </span>
                      <span className="text-2xl font-black text-emerald-500 italic">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Service Efficiency */}
                  <div className="group/stat">
                    <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] mb-2 group-hover/stat:text-blue-400 transition-colors">
                      Service Efficiency
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white italic tracking-tighter tabular-nums">
                        {maintenance.length > 0
                          ? Math.round(
                              ((maintenance.length -
                                (complaints + maintenanceTasks)) /
                                maintenance.length) *
                                100,
                            )
                          : 100}
                      </span>
                      <div className="flex flex-col mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-black text-blue-600 italic leading-none">
                            %
                          </span>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <span className="text-[8px] font-bold text-blue-500/50 uppercase tracking-tighter">
                          Fulfillment
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTOR LIST --- */}
              <div className="relative z-10 mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-8">
                {wingsList.map((wing, index) => (
                  <motion.div
                    key={wing}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.1, x: 5 }}
                    className="flex items-center gap-4 cursor-default group/wing"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black italic text-[10px] text-blue-500 border border-white/10 group-hover/wing:bg-blue-600 group-hover/wing:text-white transition-all duration-300">
                      {wing}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover/wing:text-blue-500 transition-colors">
                        Sector {wing}
                      </p>
                      <p className="text-[10px] font-bold text-white tracking-tight">
                        {
                          properties.filter(
                            (p) =>
                              p.wing === wing &&
                              (Number(p.tenants) > 0 || p.isOccupied),
                          ).length
                        }{" "}
                        / {properties.filter((p) => p.wing === wing).length}{" "}
                        <span className="text-slate-500 group-hover/wing:text-blue-300">
                          Active Units
                        </span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* --- ACCOUNT SECURITY CARD --- */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              onClick={handleAdminResetPassword}
              className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 relative group cursor-pointer hover:bg-white/[0.08] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <ArrowUpRight className="absolute top-8 right-8 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 group-hover:-translate-y-1 w-6 h-6 transition-all" />
              <ShieldCheck className="text-amber-500 mb-6 w-10 h-10 transition-transform group-hover:rotate-[12deg] duration-500" />

              <div className="flex justify-between items-center mb-8">
                <h3 className="text-white font-black uppercase text-xs tracking-[0.2em]">
                  Account Security
                </h3>
                {requests.length > 0 && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full animate-bounce">
                    <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">
                      {requests.length} Action Required
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {requests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map((req, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Mail className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-white font-bold">
                              {req.email.split("@")[0]}
                            </span>
                            <span className="text-[8px] text-slate-500 font-black uppercase">
                              Request
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleMarkAsDone(req._id, e)}
                          className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all"
                        >
                          Mark Done
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-white/10 rounded-3xl">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                      System Secured • No Requests
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* --- QUICK ACTIONS GRID --- */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              // Starts in hidden state
              initial="hidden"
              // Automatically triggers 'show' variants in children when this container enters viewport
              whileInView="show"
              // Animation fires once when 20% of the grid is visible
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.12, // Snappy delay between each card
                    delayChildren: 0.1, // Initial wait before the first card pops
                  },
                },
              }}
            >
              {[
                {
                  label: "Payments",
                  icon: CreditCard,
                  path: "/payments",
                  data: [
                    {
                      label: `${pendingPayments} Pending`,
                      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                    },
                    {
                      label: `${paidPayments} Paid`,
                      color:
                        "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                    },
                  ],
                },
                {
                  label: "Bookings",
                  icon: Clock,
                  path: "/bookings",
                  data: [
                    {
                      label: `${waitingBookings} Waiting`,
                      color:
                        "text-amber-500 bg-amber-500/10 border-amber-500/20",
                    },
                  ],
                },
                {
                  label: "Services",
                  icon: Wrench,
                  path: "/services",
                  data: [
                    {
                      label: `${complaints} Complaints`,
                      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                    },
                    {
                      label: `${maintenanceTasks} Tasks`,
                      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    },
                  ],
                },
                {
                  label: "Notice",
                  icon: Megaphone,
                  path: "/notice",
                  pulse: true,
                  data: [
                    {
                      label: `${notices.length} Active`,
                      color:
                        "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
                    },
                  ],
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 40, // Starts lower for a more dramatic entrance
                      scale: 0.9, // Starts smaller
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 110, // Slightly more bounce
                        damping: 14, // Controls the vibration
                        mass: 1,
                      },
                    },
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(item.path)}
                  className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 relative cursor-pointer group overflow-hidden"
                >
                  {/* Background Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors duration-500" />

                  <ArrowUpRight className="absolute top-8 right-8 text-slate-600 group-hover:text-blue-500 w-6 h-6 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />

                  <item.icon
                    className={`text-blue-500 mb-6 w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      item.pulse ? "animate-pulse" : ""
                    }`}
                  />

                  <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4 group-hover:text-blue-400 transition-colors">
                    {item.label}
                  </h3>

                  <div className="flex flex-wrap gap-2 relative z-10">
                    {item.data.map((stat, sIdx) => (
                      <span
                        key={sIdx}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${stat.color} transition-all duration-300 group-hover:brightness-125 group-hover:border-opacity-50`}
                      >
                        {stat.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* --- RESIDENT PORTAL --- */
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="space-y-12"
          >
            {/* --- RESIDENT ID "BADGE" --- */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              className="perspective-1000 group"
            >
              <motion.div
                whileHover={{ rotateX: 5, y: -5 }}
                className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center gap-8 backdrop-blur-2xl relative overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:bg-white/[0.07]"
              >
                {/* Decorative scanner effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -translate-y-full group-hover:animate-[scan_2s_linear_infinite]" />

                <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                  <Home className="text-blue-500 w-10 h-10" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 relative z-10">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
                        Verified Resident
                      </p>
                    </div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                      {userEmail?.split("@")[0] || "Resident Account"}
                    </h2>
                  </div>

                  <div className="flex gap-4">
                    {[
                      { label: "Sector", value: selectedWing },
                      { label: "Unit", value: flatInput },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center px-10 py-4 bg-black/40 rounded-[2rem] border border-white/5 min-w-[140px] group-hover:border-blue-500/20 transition-colors"
                      >
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-black text-blue-500 italic">
                          {stat.value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {isSearched && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. MY PAYMENTS CARD */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 },
                  }}
                  whileHover={{ y: -10, rotateY: -5, rotateX: 2 }}
                  onClick={() => {
                    const targetWing = selectedWing
                      .toLowerCase()
                      .includes("wing")
                      ? selectedWing
                      : `Wing ${selectedWing}`;
                    navigate("/payments", {
                      state: { autoWing: targetWing, autoFlat: flatInput },
                    });
                  }}
                  className="perspective-1000 bg-white/[0.03] p-12 rounded-[3.5rem] border border-white/5 relative group cursor-pointer hover:bg-white/[0.06] transition-all overflow-hidden"
                >
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
                  <ArrowUpRight className="absolute top-10 right-10 text-slate-600 group-hover:text-blue-500 w-7 h-7 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                  <CreditCard className="text-blue-500 mb-8 w-12 h-12" />
                  <h3 className="text-white font-black uppercase text-[11px] tracking-[0.2em] mb-6">
                    Financial Status
                  </h3>
                  <div className="flex gap-3">
                    <span
                      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${myDuePaymentsCount > 0 ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                    >
                      {myDuePaymentsCount} Pending
                    </span>
                    <span className="bg-blue-500/10 text-blue-500 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-blue-500/20">
                      {myClearedPaymentsCount} Cleared
                    </span>
                  </div>
                </motion.div>

                {/* 2. SERVICE REQUESTS CARD */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    show: { opacity: 1, x: 0 },
                  }}
                  whileHover={{ y: -10, rotateY: 5, rotateX: 2 }}
                  onClick={() => {
                    const targetWing = selectedWing
                      .toLowerCase()
                      .includes("wing")
                      ? selectedWing
                      : `Wing ${selectedWing}`;
                    navigate("/services", {
                      state: { autoWing: targetWing, autoFlat: flatInput },
                    });
                  }}
                  className="perspective-1000 bg-white/[0.03] p-12 rounded-[3.5rem] border border-white/5 relative group cursor-pointer hover:bg-white/[0.06] transition-all overflow-hidden"
                >
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
                  <ArrowUpRight className="absolute top-10 right-10 text-slate-600 group-hover:text-blue-500 w-7 h-7" />
                  <Wrench className="text-blue-500 mb-8 w-12 h-12" />
                  <h3 className="text-white font-black uppercase text-[11px] tracking-[0.2em] mb-6">
                    Support Tickets
                  </h3>
                  <div className="flex gap-3">
                    <span className="bg-blue-500/10 text-blue-500 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-blue-500/20">
                      {pendingMyRequestsCount} Active
                    </span>
                    <span className="bg-white/5 text-slate-500 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-white/10">
                      History: {myRequests.length}
                    </span>
                  </div>
                </motion.div>

                {/* 3. COMMUNITY NOTICE BOARD (FULL WIDTH) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  onClick={() => {
                    const targetWing = selectedWing
                      .toLowerCase()
                      .includes("wing")
                      ? selectedWing
                      : `Wing ${selectedWing}`;
                    navigate("/notice", { state: { autoWing: targetWing } });
                  }}
                  className="md:col-span-2 bg-gradient-to-br from-blue-600/15 via-white/[0.02] to-transparent p-12 rounded-[3.5rem] border border-blue-500/20 relative cursor-pointer overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Megaphone className="w-32 h-32 -rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Megaphone className="text-blue-500 w-8 h-8 animate-bounce" />
                        <h3 className="text-white font-black uppercase text-xs tracking-[0.3em]">
                          Community Notice Board
                        </h3>
                      </div>
                      <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                        Real-time broadcasts for{" "}
                        <span className="text-blue-400 font-bold">
                          Sector {selectedWing}
                        </span>{" "}
                        and general community protocols.
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                        {notices.length} Active Notices
                      </span>
                      <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-tighter">
                        Updated Just Now
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* --- BOTTOM SESSION FOOTER --- */}
        {/* --- EXIT SECTION --- */}
        <div className="mt-20 pt-12 border-t border-white/5 flex justify-center">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-4 px-10 py-4 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(244,63,94,0.1)]"
          >
            <span className="text-rose-500 group-hover:text-white font-black text-xs uppercase tracking-[0.2em]">
              Exit Secure Session
            </span>
            <LogOut className="w-5 h-5 text-rose-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </PageLayout>
    </motion.div>
  );
}
