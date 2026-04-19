import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, RotateCcw, IndianRupee } from "lucide-react";
import PaymentQRModal from "../components/PaymentQRModal";
import ManualBillModal from "../components/ManualBillModal";

export default function TransactionHub() {
  const [transactions, setTransactions] = useState([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSaveBill = async (formData) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/transactions",
        formData,
      );

      // Check for 201 (Created)
      if (response.status === 201) {
        await fetchTransactions(); // Refresh the list
        setIsBillModalOpen(false); // Close the modal
      }
    } catch (err) {
      console.error("Full Error Object:", err);
      alert(
        "Generation Failed: " + (err.response?.data?.error || "Server Error"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettlePayment = async (utr) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/transactions/${selectedTx._id}`,
        {
          utr: utr,
          paidAt: new Date().toLocaleDateString("en-IN"),
        },
      );
      fetchTransactions();
      setIsQRModalOpen(false);
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setIsBillModalOpen(true)}
          className="bg-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white mb-8 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Issue New Bill
        </button>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group hover:border-blue-500/30 transition-all"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-black italic text-xs uppercase opacity-60">
                    INV: {tx.billId}
                  </h3>
                  {/* FLAT NUMBER BADGE */}
                  {tx.flatNo && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                      Flat {tx.flatNo}
                    </span>
                  )}
                </div>

                <p className="text-blue-500 font-bold text-xl flex items-center gap-1">
                  <span className="text-sm opacity-80">₹</span>
                  {Number(tx.amount).toLocaleString("en-IN")}
                </p>

                {/* WING INDICATOR */}
                <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">
                  {tx.wing || "General Ledger"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {tx.status === "Pending" ? (
                  <button
                    onClick={() => {
                      setSelectedTx(tx);
                      setIsQRModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-md shadow-blue-600/10"
                  >
                    Mark Payment
                  </button>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      Paid
                    </span>
                    <span className="text-[8px] text-slate-600 font-bold mt-1 uppercase">
                      {tx.paidAt}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(tx._id)}
                  className="p-2.5 rounded-xl bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ManualBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSave={handleSaveBill}
      />

      {selectedTx && (
        <PaymentQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          amount={selectedTx.amount}
          onVerify={handleSettlePayment}
        />
      )}
    </div>
  );
}
