import React from "react";

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SHARED HEADER STYLE */}
      <header className="mb-12 relative">
        <div className="absolute -top-20 -left-10 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
        <h2 className="text-5xl font-black tracking-tighter italic text-white">
          {title} <span className="text-blue-600 not-italic">.</span>
        </h2>
        <p className="mt-2 text-slate-500 font-medium tracking-[0.2em] uppercase text-[9px]">
          {subtitle}
        </p>
      </header>

      {/* CONTENT AREA */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        {children}
      </div>
    </div>
  );
}
