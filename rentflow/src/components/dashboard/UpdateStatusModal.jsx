import React, { useState } from "react";
import { X, Save, Zap } from "lucide-react";

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onUpdate,
  wings,
}) {
  const [formData, setFormData] = useState({ id: "A", vac: "", range: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0A0A0A] w-full max-w-md rounded-[3rem] p-12 border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)] relative overflow-hidden">
        {/* Aesthetic background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 blur-[80px] rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Zap className="text-blue-500" size={20} />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">
            System Sync
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onUpdate({
              id: formData.id,
              vac: Number(formData.vac),
              range: formData.range,
            });
          }}
          className="space-y-8"
        >
          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">
              Target Wing
            </label>
            <select
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            >
              {wings.map((w) => (
                <option key={w.id} value={w.id} className="bg-black">
                  Wing {w.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">
                Vacancy
              </label>
              <input
                type="number"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500 transition-all"
                value={formData.vac}
                onChange={(e) =>
                  setFormData({ ...formData, vac: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">
                Price Set
              </label>
              <input
                type="text"
                placeholder="15K-20K"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-blue-500 transition-all"
                value={formData.range}
                onChange={(e) =>
                  setFormData({ ...formData, range: e.target.value })
                }
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 mt-4"
          >
            <Save size={16} /> Update Real-Time Data
          </button>
        </form>
      </div>
    </div>
  );
}
