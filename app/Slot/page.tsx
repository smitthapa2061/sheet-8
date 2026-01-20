"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SlotData {
  ColumnA: string;
  ColumnB: string;
  ColumnC: string;
  ColumnD: string;
}

interface SetupData {
  ColumnB: string;
}

const SlotListData = () => {
  const [slotList, setSlotList] = useState<SlotData[]>([]);
  const [setupData, setSetupData] = useState<SetupData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchSlotList = async () => {
   const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
      const range = "SlotList!A1:H21";

      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        const data = await res.json();
        const mappedData: SlotData[] = (data.values as string[][])
          .map(
            (row: string[]): SlotData => ({
              ColumnA: row[0] || "",
              ColumnB: row[1] || "",
              ColumnC: row[2] || "",
              ColumnD: row[3] || "",
            })
          )
          .filter((row) => row.ColumnB !== "");

        setSlotList(mappedData);
      } catch (err) {
        console.error("Failed to fetch slot list:", err);
      }
    };

    const fetchSetupData = async () => {
  const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
      const range = "setup!A2:B10";

      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        const data = await res.json();
        const mappedData: SetupData[] = (data.values as string[][])
          .map(
            (row: string[]): SetupData => ({
              ColumnB: row[1] || "",
            })
          )
          .filter((row) => row.ColumnB !== "");

        setSetupData(mappedData);
      } catch (err) {
        console.error("Failed to fetch setup data:", err);
      }
    };

    fetchSlotList();
    fetchSetupData();
  }, []);

  // Rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage === 0 ? 1 : 0));
    }, 15000); // 5 seconds

    return () => clearInterval(interval);
  }, []);

  const visibleSlotList = slotList.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  return (
    <div className="w-[1920px] h-[1080px] ">
      <div className="text-white text-[140px] font-[teko] w-[980px] h-[170px] border border-transparent rounded-[10px] flex justify-center font-[800] relative left-[550px] top-[-120px] mb-[70px]">
        <div className="relative top-[160px]">{setupData[0]?.ColumnB}</div>
      </div>

      {setupData.length > 0 && (
        <div
          style={{ backgroundColor: setupData[5]?.ColumnB || "white" }}
          className="w-[900px] h-[70px] mb-[px] relative left-[575px] text-[50px] text-white font-[orbitron] font-[800] text-center tracking-wider top-[700px]"
        >
          <div className="relative top-[-3px]">
            {setupData[2]?.ColumnB} - DAY {setupData[3]?.ColumnB}
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 p-[270px] scale-60 relative left-[-480px] top-[560px] mr-[20px]">
        {setupData.length > 0 &&
          visibleSlotList.map((row, index) => (
            <div
              key={index}
              style={{
                clipPath:
                  "polygon(100% 0%, 90% 100%, 20% 100%,-40% 0%, 0% 0%,70% 0%,100% 0%)",
              }}
              className="flex flex-col gap-0 p-0 border rounded-lg  w-[230px] h-[170px] mt-[70px] relative top-[-960px] left-[594px]"
            >
              <div className="bg-[white] w-[230px] h-[400px] border rounded-lg flex justify-center relative top-[2px]">
                <Image
                  src={
                    row.ColumnC ||
                    "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921117/orqtufih6h2efu2s24um.png"
                  }
                  alt="Slot Image"
                  width={170}
                  height={160}
                  className="relative top-[-10px]"
                />
              </div>
              <div
                style={{ backgroundColor: setupData[5]?.ColumnB || "red" }}
                className="w-[200px] h-[60px] flex justify-center items-center font-[300] text-white border rounded-lg text-[30px] font-bebas-neue relative top-[-40px] left-[-20px]"
              >
                <div className="relative top-[px]">
                  {row.ColumnA}.{row.ColumnB}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SlotListData;
