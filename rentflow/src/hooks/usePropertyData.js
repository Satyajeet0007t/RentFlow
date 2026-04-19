import { useState, useEffect } from "react";
import axios from "axios";

export function usePropertyData() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWingContext, setSelectedWingContext] = useState(null);

  // 1. Start with an EMPTY array.
  // If the screen is blank, it means your DB is empty.
  const [wingStats, setWingStats] = useState([]);

  const syncWithDatabase = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/properties");

      if (res.data && res.data.length > 0) {
        const dbData = res.data.map((p) => ({
          id: p.name, // This will be "A", "B", etc.
          vac: Number(p.vac),
          address: p.address || "Luxury Residency, Pune",
          bhk: p.bhk || "1-2 BHK",
          range: p.range || "15K-20K",
        }));
        setWingStats(dbData);
      }
    } catch (err) {
      console.error("Connection to MongoDB failed.");
    }
  };

  useEffect(() => {
    syncWithDatabase();
  }, []);

  const handleUpdateWing = async (updatedData) => {
    try {
      // Update DB
      await axios.patch(
        `http://localhost:5000/api/properties/${updatedData.id}`,
        {
          vac: updatedData.vac,
          tenants: updatedData.tenants,
        },
      );
      // Refresh local state from DB
      await syncWithDatabase();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed.");
    }
  };

  const navigateToBooking = (wingId) => {
    setSelectedWingContext(`Wing ${wingId}`);
    setCurrentPage("bookings");
  };

  const totalVacancy = wingStats.reduce(
    (sum, w) => sum + (Number(w.vac) || 0),
    0,
  );

  return {
    currentPage,
    setCurrentPage,
    isModalOpen,
    setIsModalOpen,
    wingStats,
    totalVacancy,
    handleUpdateWing,
    selectedWingContext,
    navigateToBooking,
  };
}
