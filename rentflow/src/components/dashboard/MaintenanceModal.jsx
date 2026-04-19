import React, { useState } from "react";
import { X, Hash, IndianRupee, Type } from "lucide-react";

export default function ManualBillModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    billId: "",
    amount: "",
    amountInWords: "",
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
  });

  // Simple Number to Words Helper (Simplified for UI)
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

  if (!isOpen) return null;

  const handleAmountChange = (val) => {
    setFormData({
      ...formData,
      amount: val,
      amountInWords: val > 0 ? toWords(val) : "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

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
          {/* Bill ID */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2 block">
              Invoice Number
            </label>
            <div className="relative">
              <Hash
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                size={16}
              />
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all"
                placeholder="INV-001"
                onChange={(e) =>
                  setFormData({ ...formData, billId: e.target.value })
                }
              />
            </div>
          </div>

          {/* Numeric Amount */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2 block">
              Amount (Numeric)
            </label>
            <div className="relative">
              <IndianRupee
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                size={16}
              />
              <input
                type="number"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all text-xl font-bold"
                placeholder="0.00"
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
          </div>

          {/* Amount in Words (Auto-generated) */}
          <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Type size={12} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                Amount in Words
              </span>
            </div>
            <p className="text-white font-bold text-sm min-h-[1.5rem]">
              {formData.amountInWords || "---"}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
          >
            Generate & Save Invoice
          </button>
        </form>
      </div>
    </div>
  );
}
