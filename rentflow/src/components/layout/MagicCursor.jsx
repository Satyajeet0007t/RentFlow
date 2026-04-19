import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const MagicCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const moveX = useSpring(cursorX, springConfig);
  const moveY = useSpring(cursorY, springConfig);

  const [cursorVariant, setCursorVariant] = useState("default");

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  useEffect(() => {
    const handleMouseOver = (e) => {
      if (
        e.target.closest("button") ||
        e.target.closest(".cursor-pointer") ||
        e.target.closest("a")
      ) {
        setCursorVariant("pointer");
      } else {
        setCursorVariant("default");
      }
    };
    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, []);

  const variants = {
    default: {
      height: 16,
      width: 16,
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      border: "1px solid rgba(59, 130, 246, 0.8)",
    },
    pointer: {
      height: 80,
      width: 80,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      border: "1px solid rgba(59, 130, 246, 0.4)",
      mixBlendMode: "difference",
    },
  };

  return (
    <div className="relative">
      <motion.div
        className="fixed pointer-events-none z-[9999] top-0 left-0 rounded-full hidden md:block"
        variants={variants}
        animate={cursorVariant}
        style={{
          x: moveX,
          y: moveY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full" />
      </motion.div>
    </div>
  );
};

// CRITICAL: Make sure this line exists and is exactly like this!
export default MagicCursor;
