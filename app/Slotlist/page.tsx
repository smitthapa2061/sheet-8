"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

/* ---------------- Interfaces ---------------- */

interface SlotData {
  ColumnA: string;
  ColumnC: string;
  ColumnF: string;
}

interface SetupData {
  ColumnB: string;
}

/* ---------------- Component ---------------- */

const SlotListData = () => {
  const [slotList, setSlotList] = useState<SlotData[]>([]);
  const [setupData, setSetupData] = useState<SetupData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 14;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID || "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    if (!apiKey || !spreadsheetId) {
      console.error("Missing Google Sheets ENV variables");
      return;
    }

    const fetchSlotList = async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/SlotList!A1:H50?key=${apiKey}`
        );

        if (!res.ok) throw new Error("SlotList fetch failed");

        const data = await res.json();

        const values = data?.values ?? [];

        const mappedData: SlotData[] = values
          .map((row: string[]) => ({
            ColumnA: row[0] || "",
            ColumnC: row[2] || "",
            ColumnF: row[5] || "",
          }))
          .filter((row: SlotData) => row.ColumnF !== "");

        setSlotList(mappedData);
      } catch (error) {
        console.error("Slot list fetch error:", error);
      }
    };

    const fetchSetupData = async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Setup!A2:B20?key=${apiKey}`
        );

        if (!res.ok) throw new Error("Setup fetch failed");

        const data = await res.json();

        const values = data?.values ?? [];

        const mappedData: SetupData[] = values.map((row: string[]) => ({
          ColumnB: row[1] || "",
        }));

        setSetupData(mappedData);
      } catch (error) {
        console.error("Setup fetch error:", error);
      }
    };

    fetchSlotList();
    fetchSetupData();
  }, [apiKey, spreadsheetId]);

  /* ---------------- Pagination ---------------- */

  useEffect(() => {
    if (slotList.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) =>
        prev >= Math.ceil(slotList.length / itemsPerPage) - 1
          ? 0
          : prev + 1
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [slotList]);

  const visibleSlotList = slotList.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  /* ---------------- Setup Values ---------------- */

  const title = setupData[0]?.ColumnB || "Tournament";
  const matchName = setupData[2]?.ColumnB || "Match";
  const day = setupData[3]?.ColumnB || "1";
  const primaryColor = setupData[5]?.ColumnB || "#ff0000";
  const backgroundImage = setupData[9]?.ColumnB || "";

  /* ---------------- UI ---------------- */

 return (
  <div
    className="w-[1080px] h-[1080px] relative overflow-hidden font-[orbitron] "
    style={{
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    }}
  >
    {/* Dark Overlay */}
    <div className="absolute inset-0  " />

  

    {/* Title Section */}
    <div className="absolute top-[95px] w-[100%] flex flex-col items-center z-10 ">
      
      <div className="text-white text-[70px] font-[teko] font-[800]  drop-shadow-lg">
        {title}
      </div>

      <div
        style={{
          background: `linear-gradient(90deg, ${primaryColor}, #000)`
        }}
        className="mt-[-20px] px-[40px] py-[8px]  text-white text-[26px] font-[700] tracking-widest shadow-lg"
      >
        {matchName} 
      </div>
    </div>

    {/* Slot Container */}
    <div className="absolute top-[260px]  grid grid-cols-2 gap-[15px] z-10 left-[60px]">
      
      {visibleSlotList.map((row, index) => (
        <div
          key={index}
          className="relative flex items-center gap-[25px] w-[480px] h-[85px] rounded-xl px-[25px] 
          bg-gradient-to-r from-black/80 to-black/50 
          border border-white/10 backdrop-blur-md 
          shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          
          {/* Left Accent Line */}
          <div
            style={{ background: primaryColor }}
            className="absolute left-0 top-0 h-full w-[5px] rounded-l-xl shadow-[0_0_10px]"
          />

          {/* Slot Number */}
          <div
            style={{
              background: `linear-gradient(180deg, ${primaryColor}, #000)`
            }}
            className="w-[60px] h-[60px] flex items-center justify-center 
            text-white text-[46px] absolute font-[teko] rounded-md font-[300] 
            shadow-[0_0_10px]"
          >
            {row.ColumnA}
          </div>

          {/* Team Logo */}
          <div className="w-[60px] h-[60px]  rounded-md flex items-center justify-center border border-white/10 ml-[70px]">
            <Image
              src={
                row.ColumnC ||
                "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921117/orqtufih6h2efu2s24um.png"
              }
              alt="team logo"
              width={55}
              height={55}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Team Info */}
          <div className="flex flex-col">
            <div className="text-white text-[24px] font-[700] tracking-wide">
              {row.ColumnF.toUpperCase()}
            </div>

          
          </div>
        </div>
      ))}
    </div>

   
  </div>
);
};

export default SlotListData;