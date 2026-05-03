
import React from "react";
import Image from "next/image"; // Make sure you import Image from Next.js
import { div } from "framer-motion/client";
// Google Sheets API details

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID || "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const range = "SlotList!A1:C21";
const range2 = "setup!A2:B10";

// Define type for the row structure
interface SlotRow {
  ColumnA: string;
  ColumnB: string;
  ColumnC: string;
}

// Function to fetch SlotList data
const fetchSlotListData = async (): Promise<SlotRow[]> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch SlotList data");
    const result = await response.json();

    return (
      result.values?.map(
        (row: string[]): SlotRow => ({
          ColumnA: row[0] || "",
          ColumnB: row[1] || "",
          ColumnC: row[2] || "",
        })
      ) || []
    );
  } catch (err) {
    console.error("Error fetching SlotList data:", err);
    return [];
  }
};

// Function to fetch setup data
const fetchSetupData = async (): Promise<Record<string, string>> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch setup data");
    const result = await response.json();

    return Object.fromEntries(
      (result.values as string[][])?.map((row: string[]) => [row[0], row[1]]) ||
        []
    );
  } catch (err) {
    console.error("Error fetching Setup data:", err);
    return {};
  }
};

// **Server-side rendered component**
const Map = async () => {
  const slotData = await fetchSlotListData();
  const setupData = await fetchSetupData();

  // Colors from setup sheet
  const round = setupData["TOR NAME"] || "#cb201e";
  const primaryColor = setupData["PRIMARY COLOR"] || "#cb201e";
  const textColor = setupData["TEXT COLOR 1"] || "black";

  // Split data into two halves for left & right containers
  const firstHalf = slotData.slice(0, 5);
  const secondHalf = slotData.slice(5, 10);
  const thirdHalf = slotData.slice(10, 15);
  const fourthHalf = slotData.slice(15, 20);

  return (
    <div>
      <div className="w-[1920px] h-[1080px] flex justify-center items-center ">
        <div className="flex  left-[540px] absolute ">
          {/* Left side container */}
          <div className="flex flex-col gap-3 items-center relative right-[500px] top-[60px] ">
            {firstHalf.map((row: SlotRow, index: number) =>
              row.ColumnB ? (
                <div
                  key={index}
                  className="flex flex-col gap-3 p-0 w-[150px] h-[120px] relative mb-[60px] bg-[#00000096]"
                >
                  <div className="w-[150px] h-[20px] flex justify-center absolute top-[2px] left-[0px]">
                    <Image
                      src={
                        row.ColumnC ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      alt=""
                      className="w-[170px] h-[120px] p-2"
                      width={100}
                      height={50}
                    />
                  </div>
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="bg-black w-[100%] h-[40px] absolute top-[120px] text-white font-bebas-neue text-[25px] flex items-center justify-center"
                  >
                    <div
                      style={{
                        clipPath:
                          "polygon(0% 0%, 100% 0%, 100% 100%, 40% 100%, 100% 80%, 0% 90%)",
                      }}
                      className="mt-[2px]"
                    >
                      {row.ColumnB}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div className="flex flex-col gap-3 items-center relative right-[450px] top-[60px]">
            {secondHalf.map((row: SlotRow, index: number) =>
              row.ColumnB ? (
                <div
                  key={index}
                  className="flex flex-col gap-3 p-0 w-[150px] h-[120px] relative mb-[60px] bg-[#00000096]"
                >
                  <div className="w-[150px] h-[20px] flex justify-center absolute top-[2px] left-[0px]">
                    <Image
                      src={
                        row.ColumnC ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      alt=""
                      className="w-[170px] h-[120px] p-2"
                      width={100}
                      height={50}
                    />
                  </div>
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="bg-black w-[100%] h-[40px] absolute top-[120px] text-white font-bebas-neue text-[25px] flex items-center justify-center"
                  >
                    <div
                      style={{
                        clipPath:
                          "polygon(0% 0%, 100% 0%, 100% 100%, 40% 100%, 100% 80%, 0% 90%)",
                      }}
                      className="mt-[2px]"
                    >
                      {row.ColumnB}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="w-[50px]" />

        {/* Right side container */}
        <div className="flex   absolute">
          {/* Left side container */}
          <div className="flex flex-col gap-3 items-center relative left-[920px] top-[60px] ">
            {fourthHalf.map((row: SlotRow, index: number) =>
              row.ColumnB ? (
                <div
                  key={index}
                  className="flex flex-col gap-3 p-0 w-[150px] h-[120px] relative mb-[60px] bg-[#00000096]"
                >
                  <div className="w-[150px] h-[20px] flex justify-center absolute top-[2px] left-[0px]">
                    <Image
                      src={
                        row.ColumnC ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      alt=""
                      className="w-[170px] h-[120px] p-2"
                      width={100}
                      height={50}
                    />
                  </div>
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="bg-black w-[100%] h-[40px] absolute top-[120px] text-white font-bebas-neue text-[25px] flex items-center justify-center"
                  >
                    <div
                      style={{
                        clipPath:
                          "polygon(0% 0%, 100% 0%, 100% 100%, 40% 100%, 100% 80%, 0% 90%)",
                      }}
                      className="mt-[2px]"
                    >
                      {row.ColumnB}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div className="flex flex-col gap-3 items-center relative left-[570px] top-[60px]">
            {thirdHalf.map((row: SlotRow, index: number) =>
              row.ColumnB ? (
                <div
                  key={index}
                  className="flex flex-col gap-3 p-0 w-[150px] h-[120px] relative mb-[60px] bg-[#00000096]"
                >
                  <div className="w-[150px] h-[20px] flex justify-center absolute top-[2px] left-[0px]">
                    <Image
                      src={
                        row.ColumnC ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      alt=""
                      className="w-[170px] h-[120px] p-2"
                      width={100}
                      height={50}
                    />
                  </div>
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="bg-black w-[100%] h-[40px] absolute top-[120px] text-white font-bebas-neue text-[25px] flex items-center justify-center"
                  >
                    <div
                      style={{
                        clipPath:
                          "polygon(0% 0%, 100% 0%, 100% 100%, 40% 100%, 100% 80%, 0% 90%)",
                      }}
                      className="mt-[2px]"
                    >
                      {row.ColumnB}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
        {/* Border box */}
        <div className="w-[1080px] h-[1080px] border-white border-[10px] absolute left-[430px] top-[-0px]" />
      </div>
    </div>
  );
};

export default Map;
