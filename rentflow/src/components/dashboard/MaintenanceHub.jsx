import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import axios from "axios";
import {
  AlertCircle,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Zap,
  CreditCard,
} from "lucide-react";
import PageLayout from "../layout/PageLayout";

const WINGS = ["Wing A", "Wing B", "Wing C", "Wing D", "Wing E", "Wing F"];

// MOVE PARALLAX ITEM OUTSIDE AND CLOSE IT PROPERLY
function ParallaxItem({ children, index }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({ target: ref });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? 30 : -30, index % 2 === 0 ? -30 : 30],
  );

  return (
    // Add 'relative' to this wrapper
    <motion.div ref={ref} style={{ y }} className="relative">
      {children}
    </motion.div>
  );
}

export default function MaintenanceHub() {
  const [data, setData] = useState([]);
  const location = useLocation();
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(null);
  const [filterWing, setFilterWing] = useState(
    location.state?.autoWing || "Wing A",
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    flatNo: location.state?.autoFlat || "",
  });

  //wing Navigation Scroll
  const { scrollYProgress } = useScroll();
  const navX = useTransform(scrollYProgress, [0, 0.3], ["0%", "-5%"]);

  //Action Card Scroll
  const { scrollY } = useScroll();
  const cardRotate = useTransform(scrollY, (latest) => {
    const velocity = scrollY.getVelocity();
    return velocity > 0 ? -1.5 : 1.5; // Subtle tilt based on direction
  });

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (location.state?.autoWing) {
      setFilterWing(location.state.autoWing);

      setIsSearched(true);
      fetchItems();

      // Also pre-fill the flat number if available
      setFormData((prev) => ({
        ...prev,
        flatNo: location.state.autoFlat || prev.flatNo,
      }));
    }
  }, [location.state]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/maintenance");
      console.log("API Response:", res.data); // DEBUG: Check if data exists for the wing
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Replace your existing useEffects with this ONE robust effect
  useEffect(() => {
    fetchItems();

    // Optional: Update the form's flat number if navigation state changes
    if (location.state?.autoFlat) {
      setFormData((prev) => ({ ...prev, flatNo: location.state.autoFlat }));
    }
  }, [filterWing, location.state]); // This triggers EVERY time you click a new wing

  const handleQuickSubmit = async (e, type) => {
    e.preventDefault();

    const payload = {
      type: type,
      title: formData.title,
      description: formData.description,
      flatNo: formData.flatNo,
      wing: filterWing,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/maintenance",
        payload,
      );
      console.log("Success:", response.data);
      setActiveAction(null);
      setFormData({ title: "", description: "", flatNo: "" });
      fetchItems();
    } catch (err) {
      console.error("DETAILED ERROR:", err.response?.data);
      alert("Validation Error: " + err.response?.data?.message);
    }
  };
  const markDone = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/maintenance/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Permanent delete?")) {
      try {
        await axios.delete(`http://localhost:5000/api/maintenance/${id}`);
        fetchItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ROBUST FILTER: Handles case sensitivity and extra spaces

  const filteredData = data.filter((item) => {
    const itemWing = String(item.wing || "")
      .toLowerCase()
      .trim();
    const targetWing = String(filterWing || "")
      .toLowerCase()
      .trim();

    // This handles both "Wing A" and "A"
    return (
      itemWing === targetWing ||
      itemWing === targetWing.replace("wing", "").trim()
    );
  });

  const waveContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // This creates the "one after another" effect
      },
    },
  };

  const waveItem = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  if (loading)
    return (
      <div className="pt-44 text-center font-black animate-pulse text-blue-500 italic text-2xl uppercase tracking-widest">
        Syncing {filterWing} Hub...
      </div>
    );

  return (
    <PageLayout title="Services" subtitle={`Managing Section: ${filterWing}`}>
      <motion.div
        variants={waveContainer}
        initial="hidden"
        animate="show"
        className="relative min-h-screen"
      >
        {/* SECTION 1: WING NAVIGATION (FOLLOWS HORIZONTAL SCROLL) */}
        <motion.div
          variants={waveItem}
          className="flex flex-wrap items-center gap-4 mb-8 p-6"
        >
          {WINGS.map((wing) => (
            /* 1. THE STABLE ANCHOR */
            <motion.div
              key={wing}
              className="relative"
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <motion.button
                /* 2. THE ANIMATED CHILD */
                variants={{
                  rest: { scale: 1, y: 0, filter: "brightness(1)", zIndex: 10 },
                  hover: {
                    scale: 1.18,
                    y: -12,
                    filter: "brightness(1.2)",
                    zIndex: 50,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterWing(wing)}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors border ${
                  filterWing === wing
                    ? "bg-blue-600 text-white border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                    : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {filterWing === wing && (
                  <motion.div
                    layoutId="bubble-glow"
                    className="absolute inset-0 rounded-2xl bg-blue-400/25 blur-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{wing}</span>
              </motion.button>

              {/* 3. THE GHOST HITBOX */}
              <div className="absolute inset-0 -bottom-4 bg-transparent" />
            </motion.div>
          ))}
        </motion.div>

        {/* SECTION 2: ACTION CARDS (WITH DIRECTIONAL TILT) */}
        <motion.div
          className="relative space-y-4 pb-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: "some", margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 },
            },
          }}
        >
          {/* COMPLAINT CARD */}
          <motion.div
            style={{}} // Directional Detection Hook applied here
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 110, damping: 14 },
              },
            }}
            whileHover={{
              y: -8,
              scale: 1.01,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
            className={`relative rounded-[2.5rem] border transition-colors duration-500 overflow-hidden transform-gpu preserve-3d backface-hidden ${
              activeAction === "Complaint"
                ? "bg-rose-500/5 border-rose-500/40"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            <div className="p-10">
              {activeAction === "Complaint" ? (
                <form
                  onSubmit={(e) => handleQuickSubmit(e, "Complaint")}
                  className="animate-in fade-in zoom-in-95 duration-300 space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                      <AlertCircle size={20} className="text-rose-500" />{" "}
                      {filterWing} Complaint
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black text-blue-500 uppercase">
                      {filterWing}
                    </div>
                    <input
                      name="flatNo"
                      required
                      placeholder="FLAT NO."
                      value={formData.flatNo}
                      onChange={(e) =>
                        setFormData({ ...formData, flatNo: e.target.value })
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-rose-500"
                    />
                  </div>
                  <input
                    name="title"
                    required
                    placeholder="ISSUE TITLE"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-rose-500 uppercase"
                  />
                  <textarea
                    name="description"
                    required
                    placeholder="DESCRIBE THE ISSUE..."
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-rose-500 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20"
                  >
                    Log Complaint
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-start">
                  <Wrench className="text-rose-500 mb-6" size={28} />
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                    Service Engineering
                  </h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-8 font-bold">
                    New Ticket for {filterWing}
                  </p>
                  <button
                    onClick={() => setActiveAction("Complaint")}
                    className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 px-6 py-4 rounded-xl border border-white/10 hover:bg-rose-600 transition-all"
                  >
                    Raise Complaint{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* REQUEST CARD */}
          <motion.div
            style={{}} // Directional Detection Hook applied here
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 110, damping: 14 },
              },
            }}
            whileHover={{
              y: -8,
              scale: 1.01,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
            className={`relative rounded-[2.5rem] border transition-colors duration-500 overflow-hidden transform-gpu preserve-3d backface-hidden ${
              activeAction === "Request"
                ? "bg-blue-500/5 border-blue-500/40"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            <div className="p-10">
              {activeAction === "Request" ? (
                <form
                  onSubmit={(e) => handleQuickSubmit(e, "Request")}
                  className="animate-in fade-in zoom-in-95 duration-300 space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                      <Zap size={20} className="text-blue-500" /> {filterWing}{" "}
                      Request
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black text-blue-500 uppercase">
                      {filterWing}
                    </div>
                    <input
                      name="flatNo"
                      value={formData.flatNo}
                      onChange={(e) =>
                        setFormData({ ...formData, flatNo: e.target.value })
                      }
                      required
                      placeholder="FLAT NO."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="REQUEST TITLE"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-blue-500 uppercase"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    placeholder="INSTRUCTIONS..."
                    rows="2"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                  >
                    Generate Request
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-start">
                  <CreditCard className="text-blue-500 mb-6" size={28} />
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                    Administrative Hub
                  </h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-8 font-bold">
                    Facility access for {filterWing}
                  </p>

                  {userRole === "manager" ? (
                    <button
                      onClick={() => setActiveAction("Request")}
                      className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 px-6 py-4 rounded-xl border border-white/10 hover:bg-blue-600 transition-all"
                    >
                      Generate Request{" "}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  ) : (
                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic bg-white/5 px-6 py-4 rounded-xl border border-dashed border-white/10">
                      View Only Access
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* SECTION 3: WING-SPECIFIC QUEUE (DYNAMIC LIST VIEW WITH PARALLAX) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={waveContainer} // Use the stagger variant here
          className="relative space-y-4 pb-20 min-h-[400px]" // Added relative and min-height
        >
          {filteredData.length > 0 ? (
            <div className="flex flex-col gap-4">
              {/* Table Header */}
              <div className="hidden md:flex px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">
                <div className="w-16">Type</div>
                <div className="w-24">Flat</div>
                <div className="flex-1 ml-4">Details & Full Description</div>
                <div className="w-48 text-right">Date & Management</div>
              </div>

              {filteredData.map((item, index) => (
                <ParallaxItem key={item._id} index={index}>
                  <motion.div
                    variants={{
                      hidden: {
                        opacity: 0,
                        scale: 0.5,
                        y: 10,
                      },
                      show: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        },
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      transition: { duration: 0.1 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex flex-col md:flex-row items-start md:items-center p-6 rounded-[1.5rem] border transition-all duration-300 gap-4 transform-gpu backface-hidden will-change-transform ${
                      item.status === "Done"
                        ? "opacity-40 bg-white/[0.01] border-white/5"
                        : "bg-white/[0.02] border-white/10 hover:border-blue-500/30"
                    }`}
                  >
                    {/* 1. TYPE ICON */}
                    <div className="shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          item.type === "Complaint"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {item.type === "Complaint" ? (
                          <AlertCircle size={20} />
                        ) : (
                          <Zap size={20} />
                        )}
                      </div>
                    </div>

                    {/* 2. FLAT NUMBER */}
                    <div className="md:w-24 shrink-0">
                      <div className="text-white font-black italic uppercase tracking-tighter text-xl md:text-base">
                        #{item.flatNo}
                      </div>
                      <div className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">
                        Resident
                      </div>
                    </div>

                    {/* 3. MAIN CONTENT */}
                    <div className="flex-1 min-w-0 py-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1 italic">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-[11px] font-medium break-words leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* 4. ACTIONS & DATE */}
                    <div className="shrink-0 flex flex-col items-end gap-3 self-center md:self-stretch justify-between min-w-[180px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                      <div className="text-[9px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                        <Clock size={12} className="text-blue-500/50" />{" "}
                        {item.date}
                      </div>

                      <div className="flex items-center gap-3">
                        {userRole === "manager" ? (
                          <>
                            {item.status === "Open" ? (
                              <button
                                onClick={() => markDone(item._id)}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-blue-900/20"
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500"
                                />
                                <span className="text-[8px] font-black text-emerald-500 uppercase">
                                  Completed
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="p-2.5 bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-white/5"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            {item.status === "Open" ? (
                              <span className="text-[8px] font-black text-slate-500 uppercase italic">
                                Under Review
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 size={14} />
                                <span className="text-[8px] font-black uppercase">
                                  Resolved
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </ParallaxItem>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <p className="text-slate-700 font-black uppercase text-[10px] tracking-[0.4em] italic animate-pulse">
                Waiting for {filterWing} Data Input...
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
