import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Info,
  List,
  ArrowRight,
  Clock,
  User,
  Mail,
  Phone,
  Home,
  Lock,
} from "lucide-react";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const RevealWrapper = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scale: Hits 1.06 (Strong but decent)
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.06, 0.9]);

  // Opacity: Dips more aggressively to 0.3 so the center one "POPS"
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  // Depth: Moves 100px "closer" to the camera at center
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, -100]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        opacity,
        z,
        y,
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      className="relative mb-12 will-change-transform"
    >
      {children}
    </motion.div>
  );
};

export default function BookingHub({ initialWing, wingStats = [] }) {
  // ---------------------------------------------------------
  // SECTION 1: STATE & SYNC LOGIC
  // ---------------------------------------------------------
  const location = useLocation();
  const [bookingData, setBookingData] = useState([]);
  const [expandedWing, setExpandedWing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    // 1. Check if we arrived here from a specific Property Card
    const target = location.state?.passedWing || initialWing;

    // 2. If no wing (Navbar click), just fetch data and STOP
    if (!target) {
      fetchBookings();
      setExpandedWing(null);
      return;
    }

    // 3. Format "A" to "Wing A"
    const formatted = target.toString().startsWith("Wing")
      ? target
      : `Wing ${target}`;

    setExpandedWing(formatted);

    // 4. Scroll to the element after it renders
    const scrollToWing = () => {
      const elementId = formatted.replace(/\s+/g, "-");
      const el = document.getElementById(elementId);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          const retryEl = document.getElementById(elementId);
          if (retryEl || attempts > 5) {
            retryEl?.scrollIntoView({ behavior: "smooth", block: "center" });
            clearInterval(interval);
          }
          attempts++;
        }, 100);
      }
    };

    scrollToWing();
    fetchBookings();
  }, [location.state, initialWing, wingStats]);
  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
      );
      const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
      setBookingData(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SECTION 2: HELPER FUNCTIONS (Validation & Formatting)
  // ---------------------------------------------------------
  const getBhkOptions = (bhkString) => {
    if (!bhkString) return ["1 BHK"];
    const numbers = bhkString.match(/\d+/g);
    return numbers ? numbers.map((n) => `${n} BHK`) : [bhkString];
  };

  const handleBookingSubmit = async (e, wingName) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
      residentName: formData.get("residentName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      bhkType: formData.get("bhkType"),
      wing: wingName,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        payload,
      );
      if (response.status === 201 || response.status === 200) {
        setShowForm(null);
        await fetchBookings();
        alert(`Success! Unit reserved in ${wingName}.`);
      }
    } catch (err) {
      alert(
        `Error: ${err.response?.data?.message || "Check network connection"}`,
      );
    }
  };

  if (loading)
    return (
      <div className="pt-20 text-center font-black animate-pulse text-blue-500 italic text-xl uppercase tracking-widest">
        Establishing Secure Connection...
      </div>
    );

  // ---------------------------------------------------------
  // SECTION 3: UI RENDERING
  // ---------------------------------------------------------
  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-12">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white">
          Unit <span className="text-blue-600">Portal</span>
        </h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold mt-2">
          Encrypted residency management & real-time queue
        </p>
      </div>

      {wingStats.map((wing) => {
        const currentVacancy = Number(wing.vac) || 0;
        const isSoldOut = currentVacancy === 0;
        const wingDisplayName = `Wing ${wing.id}`;

        return (
          <RevealWrapper key={wing.id}>
            {" "}
            {/* <--- WRAP IT HERE */}
            <div
              className={`
    relative group cursor-pointer
    transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
    rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl
    border border-white/10
    
    /* THE POP EFFECT */
    hover:border-blue-400
    hover:bg-white/[0.08]
    
    /* HEAVY SHADOW: This makes it feel like it's popping out physically */
    shadow-[0_10px_30px_rgba(0,0,0,0.5)]
    hover:shadow-[0_40px_70px_rgba(37,99,235,0.3)]
    hover:-translate-y-3

    ${
      expandedWing === wingDisplayName
        ? "border-blue-400 bg-white/[0.1] shadow-[0_0_50px_rgba(37,99,235,0.4)]"
        : ""
    }
  `}
            >
              <div
                key={wing.id}
                id={wingDisplayName.replace(" ", "-")}
                className={`border rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                  expandedWing === wingDisplayName
                    ? "bg-white/[0.05] border-blue-500/40 shadow-2xl"
                    : "bg-white/[0.02] border-white/5 opacity-90"
                }`}
              >
                <div
                  onClick={() =>
                    setExpandedWing(
                      expandedWing === wingDisplayName ? null : wingDisplayName,
                    )
                  }
                  className="flex items-center justify-between p-8 cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                        expandedWing === wingDisplayName
                          ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/20"
                          : "bg-white/5 border-white/10 text-slate-500"
                      }`}
                    >
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                        {wingDisplayName}
                      </h3>
                      <div
                        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isSoldOut ? "text-rose-500" : "text-emerald-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`}
                        />
                        {wing.bhk} •{" "}
                        {isSoldOut
                          ? "Sold Out"
                          : `${currentVacancy} Units Available`}
                      </div>
                    </div>
                  </div>
                  {expandedWing === wingDisplayName ? (
                    <ChevronUp className="text-blue-500" />
                  ) : (
                    <ChevronDown className="text-slate-700" />
                  )}
                </div>

                {expandedWing === wingDisplayName && (
                  <div className="px-8 pb-10 animate-in slide-in-from-top-4 duration-500">
                    <div className="h-[1px] bg-white/5 mb-10" />

                    {showForm !== wing.id ? (
                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
                          <div className="space-y-4">
                            <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                              <Info size={14} /> Unit Specs
                            </h4>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                              {wing.address ||
                                "Premium executive residences featuring high-tech automation and spatial optimization."}
                            </p>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                              <List size={14} /> Inclusions
                            </h4>
                            <ul className="space-y-2">
                              {[
                                "Biometric Access",
                                "24/7 Security",
                                "Fiber Connectivity",
                              ].map((p, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-3 text-[11px] text-slate-300 font-bold uppercase tracking-tight"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <button
                          disabled={isSoldOut}
                          onClick={() => setShowForm(wing.id)}
                          className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 transition-all ${
                            isSoldOut
                              ? "bg-white/5 text-slate-600 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95"
                          }`}
                        >
                          {isSoldOut ? (
                            "Registration Closed"
                          ) : (
                            <>
                              <ArrowRight size={16} /> Book Now
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) =>
                          handleBookingSubmit(e, wingDisplayName)
                        }
                        className="space-y-6 max-w-2xl mx-auto bg-white/[0.03] p-8 rounded-3xl border border-white/5 shadow-inner"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-black italic uppercase tracking-tighter text-xl">
                            Confirm Reservation
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowForm(null)}
                            className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:underline"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <User
                              size={14}
                              className="absolute left-4 top-4 text-blue-500"
                            />
                            <input
                              name="residentName"
                              required
                              type="text"
                              placeholder="FULL NAME"
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:border-blue-500 outline-none uppercase"
                            />
                          </div>
                          <div className="relative">
                            <Mail
                              size={14}
                              className="absolute left-4 top-4 text-blue-500"
                            />
                            <input
                              name="email"
                              required
                              type="email"
                              placeholder="EMAIL ADDRESS"
                              onInput={(e) =>
                                (e.target.value = e.target.value.toLowerCase())
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="relative">
                            <Phone
                              size={14}
                              className="absolute left-4 top-4 text-blue-500"
                            />
                            <input
                              name="phone"
                              required
                              type="tel"
                              maxLength="10"
                              pattern="\d{10}"
                              title="Exactly 10 digits required"
                              placeholder="10-DIGIT MOBILE NO."
                              onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                  /\D/g,
                                  "",
                                ))
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="relative">
                            <Home
                              size={14}
                              className="absolute left-4 top-4 text-blue-500"
                            />
                            <select
                              name="bhkType"
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                            >
                              {getBhkOptions(wing.bhk).map((opt) => (
                                <option
                                  key={opt}
                                  value={opt}
                                  className="bg-slate-900"
                                >
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-4 top-4 text-slate-500 pointer-events-none"
                            />
                          </div>
                        </div>

                        {/* CHANGE 1: Name changed to Conform booking */}
                        <button
                          type="submit"
                          className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                        >
                          Conform booking
                        </button>
                      </form>
                    )}

                    {/* ---------------------------------------------------------
                   SECTION 4: LIVE WAITING LIST (QUEUE)
                   --------------------------------------------------------- */}
                    <div className="mt-12 pt-10 border-t border-white/5">
                      <div className="flex items-center justify-between mb-8">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                          <Clock size={12} /> Active Queue: {wingDisplayName}
                        </h5>
                        <span className="text-[8px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black border border-blue-500/20">
                          LIVE SYNC
                        </span>
                      </div>

                      <div className="space-y-4">
                        {bookingData.filter((b) => b.wing === wingDisplayName)
                          .length > 0 ? (
                          bookingData
                            .filter((b) => b.wing === wingDisplayName)
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group gap-4"
                              >
                                <div className="flex items-center gap-5">
                                  <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 text-[11px] font-black border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <span className="text-sm font-black text-white uppercase tracking-tight">
                                      {item.residentName}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] text-slate-500 uppercase font-bold">
                                        {item.area}
                                      </span>
                                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                      <span className="text-[9px] text-blue-500 uppercase font-black">
                                        Status: Waiting
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CHANGE 2: Contact Details Visible in Queue Row */}
                                {/* --- CONTACT DETAILS: ROLE-BASED VISIBILITY --- */}
                                <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                  {userRole === "manager" ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Mail
                                          size={12}
                                          className="text-slate-600"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400 lowercase">
                                          {item.email}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone
                                          size={12}
                                          className="text-slate-600"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">
                                          {item.phone}
                                        </span>
                                      </div>
                                      <CheckCircle
                                        size={18}
                                        className="text-emerald-500/30 hidden md:block"
                                      />
                                    </>
                                  ) : (
                                    /* Resident View: Privacy Protection */
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                      <Lock
                                        size={10}
                                        className="text-slate-600"
                                      />
                                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                        Contact Info Protected
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-12 border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">
                              No active queue for this wing
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RevealWrapper>
        );
      })}
    </div>
  );
}
