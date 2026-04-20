import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, useScroll, useTransform } from "framer-motion";
import PaymentQRModal from "./PaymentQRModal";
import {
  ShieldCheck,
  CheckCircle2,
  Plus,
  IndianRupee,
  ChevronLeft,
  Building2,
  CreditCard,
  UserCheck,
  Trash2,
  RotateCcw,
  CalendarCheck,
} from "lucide-react";
import ManualBillModal from "./ManualBillModal";
import PageLayout from "../layout/PageLayout";

const RevealWrapper = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scale: 0.9 off-center, pops to 1.06 at the center
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.06, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);

  // Depth: Adds that 3D lift we talked about
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, -100]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        opacity,
        z,
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
};

const MiniRevealWrapper = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.1"], // Tight window for a snappier feel
  });

  // Scale: Subtle 4% pop
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.04, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.6]);

  // Minimal Y-float to keep the list alignment stable
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity, y }}
      className="will-change-transform mb-4"
    >
      {children}
    </motion.div>
  );
};

export default function RentHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [selectedWing, setSelectedWing] = useState(null);
  const [innerFilter, setInnerFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState(null);

  const userRole = localStorage.getItem("userRole");

  const wings = ["Wing A", "Wing B", "Wing C", "Wing D", "Wing E", "Wing F"];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions`,
      );
      console.log("Raw Data from Server:", res.data); // CHECK THIS IN CONSOLE

      // If res.data is an array, use it. If it's an object with a property, use that.
      const actualData = Array.isArray(res.data)
        ? res.data
        : res.data.transactions || [];

      setHistoryData(actualData);
    } catch (err) {
      console.error("Fetch error:", err);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleMarkPayment = async (id, utrValue = "MANUAL") => {
    try {
      const today = new Date().toLocaleDateString("en-IN");
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${id}`,
        {
          utr: utrValue,
          paidAt: today,
        },
      );
      fetchHistory();
      setIsQRModalOpen(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleRevert = async (id) => {
    if (window.confirm("Reverse this payment to Pending?")) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/transactions/revert/${id}`,
        );
        fetchHistory();
      } catch (err) {
        console.error("Revert failed", err);
        alert("Error reverting payment.");
      }
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this bill record permanently?")) {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/transactions/${id}`,
      );
      fetchHistory();
    }
  };

  const handleSaveManualBill = async (newBill) => {
    try {
      const payload = {
        ...newBill,
        title: "Monthly Maintenance",
        date: new Date().toLocaleDateString("en-IN"),
        wing: selectedWing,
        amount: Number(newBill.amount),
        status: "Pending",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions`,
        payload,
      );

      if (response.status === 201 || response.status === 200) {
        setIsModalOpen(false);
        fetchHistory();
      }
    } catch (err) {
      // LOOK AT YOUR BROWSER CONSOLE (Press F12)
      // This line below will tell you exactly which field the server is missing
      console.error("SERVER ERROR DETAIL:", err.response?.data);

      alert(
        `Error: ${err.response?.data?.message || "Invalid Data - Check Console"}`,
      );
    }
  };

  const openPaymentFlow = (bill) => {
    setActiveBill(bill);
    setIsQRModalOpen(true);
  };

  const finalFilteredData = historyData.filter((item) => {
    // Normalize both sides to be absolutely sure
    const dbWing = String(item.wing || "")
      .trim()
      .toUpperCase();
    const uiWing = String(selectedWing || "")
      .trim()
      .toUpperCase();

    // Also normalize 'Wing E' vs 'E'
    const dbWingShort = dbWing.replace("WING", "").trim();
    const uiWingShort = uiWing.replace("WING", "").trim();

    const isMatch = dbWingShort === uiWingShort;

    // Log this to your console so we can see the "Invisible" error
    if (!isMatch && uiWingShort !== "") {
      console.log(
        `Mismatch: DB has "${dbWingShort}", but UI is looking for "${uiWingShort}"`,
      );
    }

    const matchesStatus = innerFilter === "All" || item.status === innerFilter;

    return isMatch && matchesStatus;
  });

  if (loading)
    return (
      <div className="pt-44 text-center font-black animate-pulse text-blue-500 italic text-2xl uppercase">
        Syncing Ledger...
      </div>
    );

  return (
    <PageLayout
      title={selectedWing || "Ledger"}
      subtitle={
        selectedWing ? `Wing ${selectedWing} Finances` : "Select a wing"
      }
    >
      {!selectedWing ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-10">
          {wings.map((wing, index) => (
            <RevealWrapper key={wing}>
              <motion.button
                // Entrance animation for when the ledger page first loads
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                onClick={() => setSelectedWing(wing)}
                className="
          group w-full p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-md
          border border-white/10 relative overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          
          /* THE BUBBLE POP ON HOVER */
          hover:scale-[1.05]
          hover:border-blue-500/50
          hover:bg-blue-600/5
          hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)]
          hover:-translate-y-2
        "
              >
                {/* Decorative Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <Building2
                  className="text-slate-600 group-hover:text-blue-500 group-hover:scale-110 mb-4 transition-all duration-500"
                  size={38}
                />

                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter relative z-10">
                  {wing}
                </h3>

                <div className="flex items-center gap-2 mt-3 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] group-hover:text-blue-400 transition-colors">
                    Open Ledger
                  </p>
                </div>

                {/* Bottom edge highlight */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </RevealWrapper>
          ))}
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-10 duration-500">
          <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedWing(null);
                  setInnerFilter("All");
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <ChevronLeft size={16} /> Back to Wings
              </button>
              <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
                {["All", "Paid", "Pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setInnerFilter(status)}
                    className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                      innerFilter === status
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            {userRole === "manager" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" /> Generate {selectedWing} Bill
              </button>
            )}
          </div>

          <div className="space-y-4">
            {finalFilteredData.map((item) => (
              <MiniRevealWrapper key={item._id}>
                <div
                  className={`
        group flex items-center justify-between p-7 rounded-[2.5rem] 
        bg-white/[0.03] backdrop-blur-xl border border-white/5 
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
        relative overflow-hidden
        
        /* MINI POP HOVER EFFECTS */
        hover:bg-white/[0.06]
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
        ${
          item.status === "Paid"
            ? "hover:border-green-500/40 shadow-[inset_0_0_20px_rgba(34,197,94,0.02)]"
            : "hover:border-blue-500/40 shadow-[inset_0_0_20px_rgba(37,99,235,0.02)]"
        }
      `}
                >
                  {/* --- STACKED ACTION BUTTONS (TOP RIGHT) --- */}
                  {userRole === "manager" && (
                    <div className="absolute top-4 -right-12 group-hover:right-4 flex flex-col items-center gap-1.5 transition-all duration-500 opacity-0 group-hover:opacity-100 z-10">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/20 transition-all shadow-lg border border-rose-500/10"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>

                      {item.status === "Paid" && (
                        <button
                          onClick={() => handleRevert(item._id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-600 hover:text-amber-500 hover:bg-white/10 transition-all shadow-lg border border-white/5"
                          title="Revert to Pending"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* LEFT SECTION: Icon & Details */}
                  <div className="flex items-center gap-6 pr-20">
                    <div
                      className={`
          w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border
          ${
            item.status === "Paid"
              ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
              : "bg-white/5 text-slate-500 border-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-500 group-hover:border-blue-500/20"
          }
        `}
                    >
                      <ShieldCheck
                        size={24}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-white text-xl tracking-tight uppercase italic">
                          {item.billId}
                        </h4>
                        {item.flatNo && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                            Flat {item.flatNo}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                          Created: {item.date}
                        </p>
                        {item.status === "Paid" && (
                          <p className="text-[9px] text-green-500 uppercase tracking-[0.2em] font-black flex items-center gap-1">
                            <CalendarCheck size={10} /> Settled: {item.paidAt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION: Money & CTA */}
                  <div className="flex items-center gap-12 pr-10">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-2xl font-black text-white italic">
                        <IndianRupee
                          size={18}
                          strokeWidth={3}
                          className={
                            item.status === "Paid"
                              ? "text-green-500"
                              : "text-blue-500"
                          }
                        />
                        {Number(item.amount).toLocaleString("en-IN")}
                      </div>
                      {item.utrNumber && (
                        <p className="text-[8px] text-slate-600 font-black tracking-widest mt-1">
                          UTR: {item.utrNumber}
                        </p>
                      )}
                    </div>

                    <div className="w-44 flex flex-col gap-2">
                      {item.status === "Paid" ? (
                        <div className="flex items-center justify-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest bg-green-500/10 py-4 rounded-2xl border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                          <CheckCircle2 size={14} /> Bill Settled
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openPaymentFlow(item)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                          >
                            <CreditCard size={12} /> Make Payment
                          </button>

                          {userRole === "manager" && (
                            <button
                              onClick={() => handleMarkPayment(item._id)}
                              className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-md"
                            >
                              <UserCheck size={12} /> Mark Payment
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Animated Subtle Background Pulse */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none ${item.status === "Paid" ? "bg-green-500" : "bg-blue-500"}`}
                  />
                </div>
              </MiniRevealWrapper>
            ))}
          </div>
        </div>
      )}

      <ManualBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveManualBill}
      />
      {activeBill && (
        <PaymentQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          amount={activeBill.amount}
          onVerify={(utr) => handleMarkPayment(activeBill._id, utr)}
        />
      )}
    </PageLayout>
  );
}
