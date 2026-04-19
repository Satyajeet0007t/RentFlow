import React, { useState, useEffect } from "react";
import { X, QrCode, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function PaymentQRModal({ isOpen, onClose, amount, onVerify }) {
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setUtr("");
      setError("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndConfirm = () => {
    // 1. Basic Length Check
    if (utr.length !== 12) {
      setError("UTR must be exactly 12 digits");
      return;
    }

    // 2. Numeric Check (Regex)
    if (!/^\d+$/.test(utr)) {
      setError("UTR must contain only numbers");
      return;
    }

    setError(""); // Clear errors
    setIsProcessing(true);

    // Simulate Bank/Server Verification
    setTimeout(() => {
      onVerify(utr); // Pass the UTR back to the parent to save in DB
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      {/* Background Overlay - Clicking this also triggers onClose */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={18} />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              Secure Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount Section */}
        <div className="text-center mb-8">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
            Total Payable
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-blue-500">₹</span>
            <h3 className="text-5xl font-black text-white italic tracking-tighter">
              {Number(amount).toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        {/* QR Core */}
        <div className="bg-white p-6 rounded-[2.5rem] mb-8 shadow-2xl shadow-blue-600/10 flex flex-col items-center group">
          <QrCode
            size={160}
            className="text-black group-hover:scale-105 transition-transform duration-500"
          />
          <p className="text-[8px] text-slate-400 font-black uppercase mt-4 tracking-widest">
            Scan with any UPI App
          </p>
        </div>

        {/* Input & Validation */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              maxLength={12}
              value={utr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // Auto-strip non-numbers
                setUtr(val);
                if (val.length === 12) setError("");
              }}
              className={`w-full bg-white/5 border ${error ? "border-rose-500/50" : "border-white/10"} rounded-2xl py-5 text-white placeholder:text-slate-800 outline-none focus:border-blue-500 transition-all text-center tracking-[0.4em] font-black text-lg`}
              placeholder="000000000000"
            />

            {error && (
              <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1 text-rose-500 animate-bounce">
                <AlertCircle size={10} />
                <span className="text-[9px] font-black uppercase">{error}</span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={validateAndConfirm}
              disabled={isProcessing}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${
                isProcessing
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/20"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Verifying
                  Transaction
                </>
              ) : (
                "Verify & Settle Bill"
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2 text-slate-600 hover:text-slate-400 font-black uppercase text-[8px] tracking-widest transition-colors"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
