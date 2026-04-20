import React, { useState } from "react";
import axios from "axios";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Home,
  LayoutGrid,
  ArrowRight,
  Zap,
  ArrowLeft,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const themeColors = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-500",
    border: "border-blue-500/30",
    hover: "hover:bg-blue-700",
    glow: "bg-blue-600/10",
  },
  orange: {
    bg: "bg-orange-600",
    text: "text-orange-500",
    border: "border-orange-500/30",
    hover: "hover:bg-orange-700",
    glow: "bg-orange-600/10",
  },
};

const Login = () => {
  const navigate = useNavigate();

  // --- STATE ---

  // Add this line near your other state/variable declarations
  const savedRole = localStorage.getItem("userRole") || "resident";

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState(
    savedRole === "manager" ? "manager" : "resident",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wing, setWing] = useState(""); // NEW
  const [flatNo, setFlatNo] = useState(""); // NEW
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const isManager = role === "manager";
  const theme = isManager ? "blue" : "orange";

  const activeTheme = themeColors[theme];

  // 1. Create Motion Values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 2. Create the Tilt effect (Adjust 5 to 10 for more 'jiggle')
  const rotateX = useTransform(mouseY, [-400, 400], [5, -5]);
  const rotateY = useTransform(mouseX, [-400, 400], [-5, 5]);

  // 3. The Function to track the mouse
  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 1. STRICT SANITIZATION & VALIDATION ---
    const AUTHORIZED_MANAGER = "admin@gmail.com";
    const MANAGER_PASSWORD = "admin123";

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      alert("SYSTEM ERROR: Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // --- 2. MAGIC MOVE: MASTER MANAGER BYPASS (Strict Tab Check) ---
    if (
      !isSignup &&
      cleanEmail === AUTHORIZED_MANAGER &&
      password === MANAGER_PASSWORD
    ) {
      // Check if the user is actually on the Manager tab/role
      if (role === "manager") {
        localStorage.setItem("userWing", "HQ");
        localStorage.setItem("userFlat", "ADMIN");
        localStorage.setItem("userEmail", cleanEmail);
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("isLoggedIn", "true");

        localStorage.setItem(
          "user",
          JSON.stringify({ role: "manager", email: cleanEmail }),
        );

        console.log("Master Access Granted: Manager Console Activated.");
        navigate("/profile");
        setLoading(false);
        return;
      } else {
        // Block if trying to use Admin creds on Resident tab
        alert(
          "UNAUTHORIZED: Please use the Manager Console tab for Admin login.",
        );
        setLoading(false);
        return;
      }
    }

    // --- 3. STANDARD LOGIN/SIGNUP LOGIC ---
    if (isSignup) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        setLoading(false);
        return;
      }

      // Block residents from trying to register with the reserved Admin email
      if (cleanEmail === AUTHORIZED_MANAGER) {
        alert("SYSTEM ERROR: This email is reserved for Admin use only.");
        setLoading(false);
        return;
      }

      const payload = {
        email: cleanEmail,
        password,
        wing: wing, // Strictly use form values for residents
        flatNo: flatNo,
        role: "resident",
      };

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}"}//api/login/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (data.success) {
          setSignupSuccess(true);
          setTimeout(() => {
            setIsSignup(false);
            setSignupSuccess(false);
          }, 2000);
        } else {
          alert(data.msg);
        }
      } catch (err) {
        alert("Server connection failed");
      }
    } else {
      // --- SIGN IN LOGIC (STRICT RESIDENT ONLY) ---
      try {
        // Final security check: Ensure admin email doesn't hit the resident backend
        if (cleanEmail === AUTHORIZED_MANAGER) {
          alert("UNAUTHORIZED: Use the Manager Console for this account.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}"}//api/login/signin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          },
        );

        const data = await res.json();

        if (data.success) {
          const user = data.user || data;

          localStorage.setItem("userWing", user.wing || "");
          localStorage.setItem("userFlat", user.flatNo || "");
          localStorage.setItem(
            "userEmail",
            user.email?.toLowerCase() || cleanEmail,
          );
          localStorage.setItem("userRole", user.role || "resident");
          localStorage.setItem("isLoggedIn", "true");

          localStorage.setItem(
            "user",
            JSON.stringify({ role: user.role || "resident" }),
          );

          navigate("/profile");
        } else {
          alert(data.msg || "Invalid Credentials");
        }
      } catch (err) {
        console.error("CRITICAL CONNECTION ERROR:", err);
        alert("Connection Failed! Is your backend server running?");
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first!");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login/forgot-password-request`,
        {
          email: email,
        },
      );

      if (res.data.success) {
        alert(
          "Request sent! The Manager will see your request in the Account Security card.",
        );
      }
    } catch (err) {
      console.error(err);
      alert(
        "Failed to send request. Make sure your backend server is running.",
      );
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen bg-[#050505] flex items-center justify-center p-4 relative font-sans selection:bg-white/10`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-0 left-0 w-full h-full blur-[150px] ${activeTheme.glow}`}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-10 left-10 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all z-50"
      >
        <ArrowLeft className="w-5 h-5 text-slate-500" />
      </button>

      <motion.div
        style={{ rotateX, rotateY, perspective: 1000 }}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden z-10"
      >
        {/* LEFT PANEL */}
        <div className="p-12 md:p-20 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <Zap className={`w-6 h-6 ${activeTheme.text}`} />
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">
              Mrsmart<span className={activeTheme.text}>choice</span>
            </h1>
          </div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-6xl font-black italic text-white uppercase leading-[0.8] tracking-tighter">
              {isSignup ? "Register" : "Portal"}
              <br />
              <span className={activeTheme.text}>
                {isSignup ? "Resident" : "Login"}
              </span>
            </h2>
            <p className="text-slate-500 font-medium max-w-xs">
              Organized data for wings {wing && `(${wing})`} and flats.
            </p>
          </div>

          {/* Background Glow */}
          <div
            className={`absolute -bottom-20 -left-20 w-80 h-80 ${activeTheme.glow} blur-[120px] rounded-full`}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="p-12 md:p-20 flex flex-col justify-center bg-white/[0.01]">
          {signupSuccess ? (
            <div className="text-center space-y-4 animate-bounce">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-black text-white uppercase">
                Saved!
              </h3>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-md mx-auto w-full"
            >
              {/* ROLE TOGGLE (Only on Sign In) */}
              {!isSignup && (
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole("resident")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      !isManager
                        ? "bg-orange-600 text-white shadow-lg"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <User className="w-3 h-3" /> Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("manager")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isManager
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" /> Manager
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input */}
                <div className="border-b border-white/10 pb-2 focus-within:border-white/30 transition-colors">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                    Email
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="email"
                      placeholder="EMAIL"
                      className="w-full bg-transparent text-white font-bold outline-none"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value.toLowerCase().trim())
                      }
                    />
                  </div>
                </div>

                {/* WING & FLAT (Only on Sign Up) */}
                {isSignup && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="border-b border-white/10 pb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                        Wing
                      </label>
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-slate-600" />
                        <select
                          required
                          className="bg-transparent text-white font-bold outline-none w-full appearance-none cursor-pointer"
                          value={wing}
                          onChange={(e) => setWing(e.target.value)}
                        >
                          <option className="bg-black" value="">
                            Select
                          </option>
                          <option className="bg-black" value="A">
                            Wing A
                          </option>
                          <option className="bg-black" value="B">
                            Wing B
                          </option>
                          <option className="bg-black" value="C">
                            Wing C
                          </option>
                          <option className="bg-black" value="D">
                            Wing D
                          </option>
                          <option className="bg-black" value="E">
                            Wing E
                          </option>
                          <option className="bg-black" value="F">
                            Wing F
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="border-b border-white/10 pb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                        Flat No
                      </label>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-600" />
                        <input
                          required
                          type="text"
                          placeholder="302"
                          className="w-full bg-transparent text-white font-bold outline-none"
                          value={flatNo}
                          onChange={(e) => setFlatNo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Input */}
                {/* Password Input */}
                <div className="border-b border-white/10 pb-2 focus-within:border-white/30 transition-colors">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white font-bold outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {!isSignup &&
                    role !== "manager" &&
                    email.toLowerCase() !== "admin@mrsmartchoice.com" && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleForgotPassword()}
                          className="text-[9px] text-slate-600 hover:text-white uppercase font-black tracking-widest transition-all"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                </div>

                {/* Confirm Password (Only on Sign Up) */}
                {isSignup && (
                  <div className="border-b border-white/10 pb-2 mt-4 animate-in slide-in-from-top-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                      Confirm
                    </label>
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-600" />
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-transparent text-white font-bold outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className={`w-full py-4 ${activeTheme.bg} ${activeTheme.hover} text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl`}
              >
                {loading
                  ? "Processing..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Toggle Sign Up / Sign In */}
              {/* Toggle Sign Up / Sign In - Only shown for non-admin/residents */}
              {!isSignup &&
                role !== "manager" &&
                email.toLowerCase() !== "admin@mrsmartchoice.com" && (
                  <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    New Resident?
                    <span
                      onClick={() => setIsSignup(!isSignup)}
                      className={`${activeTheme.text} cursor-pointer ml-2 hover:underline`}
                    >
                      Sign Up
                    </span>
                  </p>
                )}

              {/* Always show "Sign In" link if the user is already on the Signup page */}
              {isSignup && (
                <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Already have account?
                  <span
                    onClick={() => setIsSignup(!isSignup)}
                    className={`${activeTheme.text} cursor-pointer ml-2 hover:underline`}
                  >
                    Sign In
                  </span>
                </p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
