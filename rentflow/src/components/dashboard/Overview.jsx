import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AboutCarousel from "./AboutCarousel";
import PropertyCard from "./PropertyCard";
import BentoGrid from "./BentoGrid";

const SectionWrapper = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    className="w-full mb-24"
  >
    {children}
  </motion.div>
);

const ManualReveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.8,
      delay,
      ease: [0.215, 0.61, 0.355, 1], // Smooth cubic-bezier
    }}
  >
    {children}
  </motion.div>
);

export default function Overview() {
  // 1. Switch to Global Window Scroll
  const { scrollYProgress } = useScroll();

  // 2. Adjust range so you can see the blur happen halfway down the page
  const filter = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["blur(0px)", "blur(0px)", "blur(15px)"],
  );

  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.4]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      {/* Test 1: Carousel Pop */}
      <ManualReveal delay={0.1}>
        <div className="mb-20">
          <AboutCarousel />
        </div>
      </ManualReveal>

      {/* Test 2: Bento Pop */}
      <ManualReveal delay={0.2}>
        <div className="mb-20 px-4">
          <h2 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8">
            System Analytics
          </h2>
          <BentoGrid />
        </div>
      </ManualReveal>

      {/* Test 3: Property Grid Pop */}
      <ManualReveal delay={0.3}>
        <div className="px-4">
          <h2 className="text-white font-black italic uppercase tracking-tighter text-3xl mb-10">
            Active Property Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <PropertyCard />
            <PropertyCard />
            <PropertyCard />
          </div>
        </div>
      </ManualReveal>
    </div>
  );
}
