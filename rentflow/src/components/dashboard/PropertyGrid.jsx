import React, { useEffect, useState } from "react";
import axios from "axios";
import PropertyCard from "./Property"; // This matches your file name

export default function PropertyGrid() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // 1. This "hits go" on your API
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/properties`,
        );
        setProperties(res.data); // This is your list of 4 houses
      } catch (err) {
        console.error("Connection failed:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 2. This "repeats" your card for every house in the DB */}
        {properties.map((item) => (
          <PropertyCard
            key={item._id}
            name={item.name}
            address={item.address}
            tenants={item.tenants}
            rent={item.rent}
          />
        ))}
      </div>
    </div>
  );
}
