import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    tag: "The New Standard",
    title: "INTELLIGENT \n LIVING SPACES.",
    desc: "Automated wing management for modern developers. Real-time occupancy tracking with Cobalt-Grade security.",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    tag: "Exclusive Access",
    title: "ELITE \n INTERIORS.",
    desc: "Experience seamless property transitions with our high-fidelity dashboard and real-time status syncing.",
    img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2076&auto=format&fit=crop",
  },
  {
    id: 3,
    tag: "Future Ready",
    title: "OS LEVEL \n CONTROL.",
    desc: "Managing your property inventory with the precision of a high-end operating system. Designed for Scale.",
    img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function AboutCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[500px] rounded-[3.5rem] overflow-hidden mb-20 border border-white/5 bg-[#050505]">
      {/* BACKGROUND IMAGE WITH MOVEMENT */}
      {/* BACKGROUND IMAGE WITH MOVEMENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].img}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.5, scale: 1 }} // Bumped opacity slightly for better visibility
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-[#0a0a0a]" // Base color if image fails
        >
          <img
            src={slides[index].img}
            className="w-full h-full object-cover"
            alt="Interior"
            loading="eager" // Force immediate loading
            onError={(e) => {
              // Fallback if the URL ever breaks again
              e.target.src =
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* DECORATIVE GLOWS */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full z-10" />

      {/* CONTENT AREA */}
      <div className="relative h-full flex flex-col justify-center px-20 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease: "anticipate" }}
          >
            <span className="text-blue-500 font-black tracking-[0.5em] uppercase text-[10px] mb-6 block">
              {slides[index].tag}
            </span>

            <h2 className="text-7xl font-black italic tracking-tighter leading-[0.9] max-w-2xl mb-8 text-white">
              {slides[index].title.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line} <br />
                </React.Fragment>
              ))}
            </h2>

            <p className="text-slate-400 max-w-md font-medium leading-relaxed text-sm">
              {slides[index].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* PROGRESS INDICATORS */}
        <div className="flex gap-3 mt-12">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full transition-all"
              animate={{
                width: i === index ? 48 : 12,
                backgroundColor:
                  i === index ? "#2563eb" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
