import React, { useState, useEffect, useRef } from "react";
import { X, Send, Radio, Activity, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function NoticeModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [targetWing, setTargetWing] = useState("Wing A");
  const [isSending, setIsSending] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    // FIX: Change 'SHORT' to 'short' (lowercase)
    const formattedDate = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    setTimeout(() => {
      onSave({
        title,
        category,
        content,
        wing: targetWing,
        date: formattedDate,
      });
      setIsSending(false);
      onClose();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 md:p-12"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        // Reduced max dimensions for a "sleeker" feel
        className="bg-[#080808] border border-white/10 w-full h-full max-w-[1000px] max-h-[750px] rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative flex flex-col"
      >
        {/* TOP SCAN LINE */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-20" />

        {/* COMPACT HEADER */}
        <div className="px-10 py-8 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Radio size={20} className="text-blue-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white italic leading-none">
                Notice Generator
              </h2>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                Node_77 • Secure Channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white hover:bg-rose-500/20 transition-all group"
          >
            <X
              size={20}
              className="group-hover:rotate-90 transition-transform"
            />
          </button>
        </div>

        {/* REFINED FORM AREA */}
        <form
          onSubmit={handleSubmit}
          className="flex-grow flex flex-col overflow-hidden"
        >
          <div className="flex-grow overflow-y-auto p-10 space-y-10">
            {/* SELECTOR GRID - Slightly more compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 block ml-1">
                  Target Sector
                </label>
                <div className="relative group">
                  <select
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-xs font-black text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                    value={targetWing}
                    onChange={(e) => setTargetWing(e.target.value)}
                  >
                    {[
                      "Wing A",
                      "Wing B",
                      "Wing C",
                      "Wing D",
                      "Wing E",
                      "Wing F",
                    ].map((wing) => (
                      <option
                        key={wing}
                        value={wing}
                        className="bg-[#0A0A0A] text-white"
                      >
                        {wing.toUpperCase()}
                      </option>
                    ))}
                    <option
                      value="All Wings"
                      className="bg-[#0A0A0A] text-blue-400 font-black"
                    >
                      GLOBAL
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 block ml-1">
                  Priority
                </label>
                <div className="flex gap-3">
                  {["General", "Urgent"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCategory(p)}
                      className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        category === p
                          ? p === "Urgent"
                            ? "bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                            : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                          : "bg-white/[0.02] border-white/5 text-slate-700 hover:border-white/20"
                      }`}
                    >
                      {p === "Urgent" ? "Critical" : "Normal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* INPUT FIELDS - Reduced text sizes for better balance */}
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 block ml-1">
                  Transmission Subject
                </label>
                <input
                  required
                  className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-all font-black uppercase tracking-tighter italic"
                  placeholder="INPUT HEADING..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 block ml-1">
                  Details
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm text-slate-400 placeholder:text-slate-800 focus:outline-none focus:border-blue-500/20 transition-all resize-none leading-relaxed"
                  placeholder="Construct your transmission here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* COMPACT FOOTER */}
          <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-4 opacity-40">
              <Activity size={12} className="text-blue-500" />
              <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-full bg-blue-500/50 w-1/2"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-all"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={isSending}
                className={`px-10 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  isSending
                    ? "bg-blue-600/10 text-blue-500"
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.2)]"
                }`}
              >
                {isSending ? "Syncing..." : "Broadcast"}
                {!isSending && <Send size={12} />}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
