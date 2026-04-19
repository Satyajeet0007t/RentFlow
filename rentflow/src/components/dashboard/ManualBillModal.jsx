import React, { useState, useEffect } from "react";
import { X, Hash, IndianRupee, Home } from "lucide-react"; // Added Home icon

export default function ManualBillModal({ isOpen, onClose, onSave }) {
  const initialState = {
    billId: "",
    flatNo: "", // Added flatNo to state
    amount: "",
    amountInWords: "",
    status: "Pending",
  };
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) setFormData(initialState);
  }, [isOpen]);

  const toWords = (num) => {
    const a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    if ((num = num.toString()).length > 9) return "Amount too high";
    let n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "and " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
        : "";
    return str + "Rupees Only";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Create the final object properly
    const dataToSave = {
      ...formData,
      amount: Number(formData.amount),
      billId: formData.billId.trim().toUpperCase(),
      flatNo: formData.flatNo.trim().toUpperCase(),
      date: new Date().toLocaleDateString("en-IN"),
    };

    // 2. Log it so you can see it in the console
    console.log("FINAL DATA BEING SENT:", dataToSave);

    // 3. ONLY call onSave once!
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
            Issue <span className="text-blue-600">Invoice</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* INVOICE ID */}
          <div className="relative">
            <Hash
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              size={16}
            />
            <input
              required
              placeholder="INV-101"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white outline-none focus:border-blue-500"
              value={formData.billId}
              onChange={(e) =>
                setFormData({ ...formData, billId: e.target.value })
              }
            />
          </div>

          {/* FLAT NUMBER - New Field */}
          <div className="relative">
            <Home
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              size={16}
            />
            <input
              required
              placeholder="FLAT NO (e.g. A-101)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white outline-none focus:border-blue-500"
              value={formData.flatNo}
              onChange={(e) =>
                setFormData({ ...formData, flatNo: e.target.value })
              }
            />
          </div>

          {/* AMOUNT */}
          <div className="relative">
            <IndianRupee
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              size={16}
            />
            <input
              type="number"
              required
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white outline-none focus:border-blue-500 text-xl font-bold"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                  amountInWords:
                    e.target.value > 0 ? toWords(e.target.value) : "",
                })
              }
            />
          </div>

          {/* AMOUNT IN WORDS */}
          <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
            <span className="text-[9px] font-black uppercase text-blue-500 block mb-1">
              Amount in Words
            </span>
            <p className="text-white font-bold text-sm min-h-[1.5rem] leading-tight first-letter:uppercase">
              {formData.amountInWords || "---"}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            Generate & Save
          </button>
        </form>
      </div>
    </div>
  );
}
