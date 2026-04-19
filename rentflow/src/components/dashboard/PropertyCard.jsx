import React from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Lock, ShieldCheck } from "lucide-react";

const RevealCard = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{
      scale: 1.02,
      y: -10,
      transition: { type: "spring", stiffness: 400, damping: 12 },
    }}
    whileTap={{ scale: 0.98 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: index * 0.1, // Staggers each card in the grid
    }}
    className="h-full"
  >
    {children}
  </motion.div>
);

export default function PropertyCard({
  name = "A",
  address = "Premium Estate, Sector 44",
  bhkType = "1-2 BHK",
  rentRange = "15K-20K",
  vacancy = 1,
  image,
  onNavigateBooking,
  index = 0,
}) {
  // 1. Force to number to prevent NaN/Broken buttons
  const safeVacancy = Number(vacancy) || 0;
  const isSoldOut = safeVacancy === 0;

  return (
    <RevealCard index={index}>
      <div
        className={`relative group p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden bg-slate-900/40 backdrop-blur-md h-full flex flex-col ${
          isSoldOut
            ? "border-white/5 opacity-60"
            : "border-white/10 hover:border-blue-500/50"
        }`}
      >
        {/* IMAGE SECTION */}
        <div className="relative h-56 w-full rounded-[2rem] overflow-hidden mb-6 bg-slate-800">
          <img
            src={
              image ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
            }
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isSoldOut ? "grayscale" : "group-hover:scale-110"
            }`}
            alt="Property"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
              <Lock size={18} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Full Occupancy
              </span>
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="px-2 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-3xl font-black italic uppercase text-white">
              Wing <span className="text-blue-500">{name}</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20 uppercase tracking-widest">
              {bhkType}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 mb-8 text-[10px] font-bold uppercase tracking-widest italic">
            <MapPin size={12} className="text-blue-500" /> {address}
          </div>

          <button
            onClick={() => onNavigateBooking(name)}
            disabled={isSoldOut}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 mb-6 ${
              isSoldOut
                ? "bg-white/5 text-slate-600 cursor-not-allowed"
                : "bg-white text-black hover:bg-blue-600 hover:text-white"
            }`}
          >
            {isSoldOut ? (
              "Registration Closed"
            ) : (
              <>
                Initialize Booking <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* FOOTER STATS */}
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-600 uppercase mb-1">
                Unit Status
              </p>
              <div
                className={`flex items-center gap-2 text-xs font-bold ${
                  isSoldOut ? "text-rose-500" : "text-emerald-400"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSoldOut ? "bg-rose-500" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {isSoldOut ? "Waitlist Only" : `${safeVacancy} Vacant Slots`}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-600 uppercase mb-1">
                Starting From
              </p>
              <p className="text-xl font-black text-white italic">
                ₹{rentRange}
              </p>
            </div>
          </div>
        </div>
      </div>
    </RevealCard>
  );
}
