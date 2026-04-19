import { motion } from "framer-motion";

// 1. The Container (The "Waterfall" trigger)
export const RevealContainer = ({ children }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2, delayChildren: 0.1 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// 2. The Item (The "Floating" effect)
export const RevealItem = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 30, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { ease: [0.22, 1, 0.36, 1], duration: 0.8 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
