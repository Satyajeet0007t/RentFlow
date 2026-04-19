/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // SAFELIST: This ensures the blue (Manager) and orange (Resident)
  // colors work even when they are called dynamically.
  safelist: [
    "bg-orange-600",
    "bg-blue-600",
    "text-orange-500",
    "text-blue-500",
    "text-orange-600",
    "text-blue-600",
    "border-orange-500/20",
    "border-blue-500/20",
    "shadow-orange-900/10",
    "shadow-blue-900/10",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: "#1A1A1A",
          gold: "#D4AF37",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem", // Added for the extra-rounded login container
      },
      // Optional: Add a custom animation for the login fade-in
      animation: {
        "fade-in": "fadeIn 0.7s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
