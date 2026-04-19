import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import axios from "axios";
import {
  Megaphone,
  Trash2,
  Plus,
  Radio,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import NoticeModal from "./NoticeModal";
import PageLayout from "../layout/PageLayout";

export default function NoticeBoard({ selectedWing = "Wing A" }) {
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const x = useTransform(scrollYProgress, [0.05, 1], ["0%", "-80%"]);

  const userRole = localStorage.getItem("userRole");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notices");
      setNotices(res.data);
    } catch (err) {
      console.error("OS Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSaveNotice = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/notices", data);
      setIsModalOpen(false);
      fetchNotices();
    } catch (err) {
      console.error("Broadcast failed", err);
    }
  };

  const deleteNotice = async (id) => {
    if (window.confirm("Purge this broadcast?")) {
      try {
        await axios.delete(`http://localhost:5000/api/notices/${id}`);
        fetchNotices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // UPDATED ROBUST FILTER LOGIC
  // FINAL UPDATED FILTER LOGIC
  const filteredNotices = notices;

  if (loading)
    return (
      <div className="pt-44 text-center font-black animate-pulse text-blue-500 italic uppercase tracking-[0.3em]">
        Establishing Connection...
      </div>
    );

  return (
    <PageLayout
      title="Notice Board"
      subtitle={`Signal Strength: Optimal • ${selectedWing}`}
    >
      {/* HEADER SECTION (Remains the same) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8 px-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Live Frequency
          </span>
        </div>

        {userRole === "manager" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus size={14} /> Create Broadcast
          </button>
        )}
      </motion.div>

      {/* HORIZONTAL SCROLL SECTION */}
      <div ref={containerRef} className="relative h-[400vh] -mx-4">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-10 px-[10vw]">
            {filteredNotices.map((n) => (
              <motion.div
                key={n._id}
                // --- INTENSIFIED POP-OUT EFFECT ON HOVER ---
                whileHover={{
                  scale: 1.15, // Significant size increase (was 1.05)
                  y: -30, // Higher lift (was -10)
                  rotate: -2, // Dynamic slight rotation
                  zIndex: 100, // Ensures it sits on top of all neighbors

                  // Stronger visual styling
                  borderColor: "rgba(59, 130, 246, 0.7)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",

                  // Massive neon glow
                  boxShadow:
                    "0 0 100px rgba(37, 99, 235, 0.4), 0 20px 50px rgba(0, 0, 0, 0.5)",

                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    mass: 1,
                  },
                }}
                // --- END INTENSIFIED EFFECT ---

                className="group relative w-[450px] h-[320px] flex-shrink-0 flex flex-col p-10 rounded-[4rem] bg-white/[0.03] border border-white/10 transition-all justify-between backdrop-blur-sm cursor-pointer"
              >
                {/* Added subtle glare effect only visible on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[4rem] transition-opacity duration-500" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Megaphone size={22} />
                  </div>
                  <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                    {n.wing || "SYSTEM"}
                  </span>
                </div>

                <div className="flex-grow space-y-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[8px] font-black uppercase px-3 py-1 rounded-md ${
                        n.category === "Urgent"
                          ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {n.category || "General"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase italic tracking-widest">
                      {n.date}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-slate-400 text-[14px] leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 group-hover:text-slate-200 transition-colors">
                    {n.content}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  {userRole === "manager" ? (
                    <button
                      onClick={() => deleteNotice(n._id)}
                      className="text-slate-600 hover:text-rose-500 transition-all p-3 rounded-xl hover:bg-rose-500/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                      <Activity size={14} className="text-blue-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Encrypted Signal
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* EMPTY STATE (Remains the same) */}
            {filteredNotices.length === 0 && (
              <div className="w-[80vw] flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.01]">
                <Activity
                  className="mb-4 text-blue-500 opacity-20 animate-pulse"
                  size={48}
                />
                <p className="opacity-30 italic font-black uppercase tracking-[1em] text-xs">
                  Searching for Signal...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* MODAL (Remains the same) */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNotice}
      />
    </PageLayout>
  );
}
