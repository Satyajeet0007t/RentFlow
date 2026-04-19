import React from "react";
import { motion } from "framer-motion";

import {
  Building2,
  Users,
  ReceiptIndianRupee,
  ArrowUpRight,
} from "lucide-react";

const BentoPop = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    // --- BUBBLE HOVER EFFECTS ---
    whileHover={{
      scale: 1.03,
      y: -8,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    }}
    whileTap={{ scale: 0.97 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: delay,
    }}
    className="h-full cursor-pointer z-0 hover:z-10" // Ensures the popped card is on top
  >
    {children}
  </motion.div>
);

export default function BentoGrid({ units, count, onViewHistory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Properties */}
      <BentoPop delay={0.1}>
        <div className="bg-black rounded-[3rem] h-full p-8 text-white relative overflow-hidden group border border-white/5 transition-colors duration-500 hover:bg-[#0a0a0a]">
          <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-125 group-hover:text-blue-500/10 transition-all duration-700" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">
            Portfolio
          </h4>
          <p className="text-6xl font-black italic tracking-tighter">{count}</p>
          <p className="text-xs font-bold text-slate-400 mt-2">Active Assets</p>
        </div>
      </BentoPop>

      {/* Total Units/Occupants */}
      <BentoPop delay={0.2}>
        <div className="bg-white rounded-[3rem] h-full p-8 border border-slate-100 shadow-xl relative overflow-hidden group transition-shadow duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
          <Users className="text-indigo-600 mb-4 w-8 h-8 group-hover:scale-125 transition-transform duration-500" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
            Occupants
          </h4>
          <p className="text-6xl font-black text-black tracking-tighter">
            {units}
          </p>
          <p className="text-xs font-bold text-slate-400 mt-2">
            Live Residents
          </p>
        </div>
      </BentoPop>

      {/* Payments Shortcut */}
      <BentoPop delay={0.3}>
        <div
          onClick={onViewHistory}
          className="bg-orange-500 rounded-[3rem] h-full p-8 text-white cursor-pointer relative group shadow-lg shadow-orange-500/20 transition-all duration-500 hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/40"
        >
          <ArrowUpRight className="absolute top-8 right-8 w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
          <ReceiptIndianRupee className="mb-4 w-8 h-8 group-hover:rotate-[15deg] group-hover:scale-110 transition-transform duration-500" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-200 mb-2">
            Payments
          </h4>
          <p className="text-3xl font-black leading-[1.1] tracking-tight italic">
            View Collection
            <br />
            Ledger
          </p>
        </div>
      </BentoPop>
    </div>
  );
}
