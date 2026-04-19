import React, { useState } from "react";
import { X, User, Mail, Phone, Home } from "lucide-react";

export default function BookingModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    requirement: "1BHK",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      customerName: "",
      email: "",
      phone: "",
      requirement: "1BHK",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-black"
        >
          <X />
        </button>
        <h2 className="text-4xl font-black tracking-tighter mb-8 italic text-black">
          Book Space
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Full Name"
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-black"
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-black"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-black"
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <select
            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-black appearance-none"
            value={formData.requirement}
            onChange={(e) =>
              setFormData({ ...formData, requirement: e.target.value })
            }
          >
            <option value="1BHK">1 BHK Apartment</option>
            <option value="2BHK">2 BHK Apartment</option>
            <option value="3BHK">3 BHK Apartment</option>
          </select>

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all mt-4"
          >
            Join Waitlist
          </button>
        </form>
      </div>
    </div>
  );
}
