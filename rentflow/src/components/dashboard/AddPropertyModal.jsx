import React, { useState } from "react";
import axios from "axios";

export default function AddPropertyModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    rent: "",
    vac: "", // Change 'tenants' to 'vac' to match the Card logic
    bhk: "1-2 BHK", // Add a default or selection
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic: If rent is high, set range higher. If low, lower.
      const rentVal = parseInt(formData.rent);
      const rangeLabel = rentVal > 20000 ? "20K-25K" : "15K-20K";

      const payload = {
        ...formData,
        rent: rentVal,
        vac: parseInt(formData.vac),
        range: rangeLabel,
        tenants: 0, // New properties start with 0 tenants
      };

      await axios.post("http://localhost:5000/api/properties", payload);

      onRefresh(); // Re-fetches the list in App.jsx
      onClose();
      setFormData({ name: "", address: "", rent: "", vac: "", bhk: "1-2 BHK" });
    } catch (err) {
      console.error("Error saving property:", err);
      alert("Database Connection Error. Check if server is running on 5000.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl scale-in-center">
        <h2 className="text-4xl font-black mb-2 text-black italic tracking-tighter uppercase">
          New Asset <span className="text-blue-600">.</span>
        </h2>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">
          Deploying new unit to RentFlow OS
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-6 bg-slate-100 rounded-[2rem] border-none font-bold text-black placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Wing Name (e.g. A, B, C)"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value.toUpperCase() })
            }
            maxLength={1}
            required
          />

          <input
            className="w-full p-6 bg-slate-100 rounded-[2rem] border-none font-bold text-black placeholder:text-slate-400 outline-none"
            placeholder="Property Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="w-full p-6 bg-slate-100 rounded-[2rem] border-none font-bold text-black placeholder:text-slate-400 outline-none"
              placeholder="Rent (₹)"
              value={formData.rent}
              onChange={(e) =>
                setFormData({ ...formData, rent: e.target.value })
              }
              required
            />
            <input
              type="number"
              className="w-full p-6 bg-slate-100 rounded-[2rem] border-none font-bold text-black placeholder:text-slate-400 outline-none"
              placeholder="Vacant Units"
              value={formData.vac}
              onChange={(e) =>
                setFormData({ ...formData, vac: e.target.value })
              }
              required
            />
          </div>

          <select
            className="w-full p-6 bg-slate-100 rounded-[2rem] border-none font-bold text-black outline-none appearance-none"
            value={formData.bhk}
            onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
          >
            <option>1-2 BHK</option>
            <option>2-3 BHK</option>
            <option>Studio</option>
          </select>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-6 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
