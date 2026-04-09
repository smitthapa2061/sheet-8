"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Next.js Image component

const apiKey: string = "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";
const spreadsheetId: string = "1f1eVMjmhmmgBPxnLI8FGkvhusLzl55jPb4_B8vjjgpo"; // Your Google Sheets ID
const range: string = "overall1!A2:O100"; // Range for overall stats
const setupRange: string = "setup!A2:B10"; // Range for setup data (like primary color)

// Define the types properly
interface DataItem {
  ColumnA: string;
  ColumnB: string;
  ColumnC: string;
  ColumnD: string;
  ColumnE: string;
  ColumnF: string;
  ColumnG: string;
}

const OverallStats: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>("#b31616"); // Default red color

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&t=${Date.now()}`;
        const response = await axios.get<{ values: string[][] }>(url);
        const values = response.data.values || [];

        const formattedData: DataItem[] = values.map((row) => ({
          ColumnA: row[0] || "",
          ColumnB: row[1] || "",
          ColumnC: row[2] || "",
          ColumnD: row[3] || "",
          ColumnE: row[4] || "",
          ColumnF: row[5] || "",
          ColumnG: row[6] || "",
        }));

        // Remove duplicates based on ColumnA (Team Name)
        const uniqueData = formattedData.reduce((acc: DataItem[], current) => {
          if (
            !acc.some(
              (item) =>
                item.ColumnA === current.ColumnA &&
                current.ColumnA.trim() !== ""
            )
          ) {
            acc.push(current);
          }
          return acc;
        }, []);

        setData(uniqueData);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    const fetchSetupData = async () => {
      try {
        const setupUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${setupRange}?key=${apiKey}&t=${Date.now()}`;
        const setupResponse = await axios.get<{ values: string[][] }>(setupUrl);
        const setupValues = setupResponse.data.values || [];

        const primaryColorRow = setupValues.find(
          (row) => row[0] === "PRIMARY COLOR"
        );
        if (primaryColorRow) {
          setPrimaryColor(primaryColorRow[1]);
        }
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
    };

    fetchSetupData();
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const sortedData = [...data].sort(
    (a, b) => (parseFloat(b.ColumnC) || 0) - (parseFloat(a.ColumnC) || 0)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: 1920 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative left-[1547px] top-[20px]">
          <div
            className="bg-[#b31616] w-[370px] h-[36px] flex justify-around text-white text-[22px] items-center font-[poppins]"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="relative left-[30px]">TEAM</div>
            <div className="relative left-[80px]">KILLS</div>
            <div className="relative left-[27px]">TOTAL</div>
          </div>

          <div>
            {sortedData.map((row, index) => (
              <div
                key={index}
                className="bg-[#01010199] w-[370px] h-[50px] flex font-bebas-neue font-[300] border-solid border-[#c1c1c1] border-b-[1px]"
              >
                <div className="text-white text-[43px] flex text-center justify-center items-center w-[60px] mt-[-5px]">
                  {index + 1}
                </div>
                <div
                  className="bg-[#ffffff] w-[170px] h-[50px] absolute left-[60px] flex justify-left text-black border-solid border-[#b51f1f] border-b-[1px]"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="w-[50px] h-[50px] absolute z-10">
                    <Image
                      src={
                        row.ColumnB ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1727161652/default_nuloh2.png"
                      }
                      alt="Team Logo"
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <div className="bg-black w-[2px] h-[46px] absolute left-[50px] top-[3px]"></div>
                  <div className="text-[45px] mt-[-6px] absolute left-[54px]">
                    {row.ColumnA}
                  </div>
                </div>
                <div className="absolute left-[245px] text-white text-[45px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
                  {row.ColumnD}
                </div>
                <div className="absolute left-[310px] text-white text-[45px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
                  {row.ColumnC}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverallStats;
