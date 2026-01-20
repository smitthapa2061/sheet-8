"use client";
import React, { useState, useEffect } from "react";
import Dead from "../Stats/assets/deaed_logo.png";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image from next/image
import { data } from "framer-motion/client";

interface SetupData {
  TOR_NAME: string;
  TOR_LOGO: string;
  ROUND: string;
  DAY: string;
  MATCHES: string;
  PRIMARY_COLOR: string;
  SECONDARY_COLOR: string;
  TEXT_COLOR_1: string;
  TEXT_COLOR_2: string;
  OPA: string;
}

// Define types for match data
interface Team {
  team_name: string;
  team_logo: string;
  Alive: number;
  team_kills: number;
  overall_points?: number;
  exclude?: boolean; // <-- ADD THIS
}

interface GoogleSheetData {
  values: [string, string][];
}

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

const LiveStats: React.FC = () => {
  const [matchData, setMatchData] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [setupData, setSetupData] = useState<SetupData | null>(null);

  const [primaryColor, setPrimaryColor] = useState<string>("#b31616");

  const url =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B12?key=${apiKey}`;

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await fetch(sheetApiUrl);
        const data: GoogleSheetData = await response.json();

        const formattedData: Record<string, string> = {};
        data.values.forEach(([key, value]) => {
          const cleanKey = key.trim().toUpperCase().replace(/\s+/g, "_"); // Format like "TEXT COLOR 1 " -> "TEXT_COLOR_1"
          formattedData[cleanKey] = value;
        });

        const structured: SetupData = {
          TOR_NAME: formattedData["TOR_NAME"] || "",
          TOR_LOGO: formattedData["TOR_LOGO"] || "",
          ROUND: formattedData["ROUND"] || "",
          DAY: formattedData["DAY"] || "",
          MATCHES: formattedData["MATCHES"] || "",
          PRIMARY_COLOR: formattedData["PRIMARY_COLOR"] || "#b31616",
          SECONDARY_COLOR: formattedData["SECONDARY_COLOR"] || "#000",
          TEXT_COLOR_1: formattedData["TEXT_COLOR_1"] || "#fff",
          TEXT_COLOR_2: formattedData["TEXT_COLOR_2"] || "#fff",
          OPA: formattedData["OPACITY"] || "#fff",
        };

        setSetupData(structured);
        setPrimaryColor(structured.PRIMARY_COLOR); // Use it in your component
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server");
        }
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          const uniqueData = data.match_info
            .filter((team: { player_rank: string }) => !team.player_rank)
            .reduce((acc: Team[], team: Team) => {
              if (!acc.some((item) => item.team_name === team.team_name)) {
                acc.push(team);
              }
              return acc;
            }, []);

          uniqueData.sort((a: Team, b: Team) => b.team_kills - a.team_kills);
          setMatchData(uniqueData);
          console.log("Fetched and filtered data:", uniqueData);
        }
        setLoading(false);
      } catch (err) {
        setError("Error fetching data.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchSetupData();
    fetchData();
    const intervalId = setInterval(fetchData, 7500);
    return () => clearInterval(intervalId);
  }, [sheetApiUrl]); // Added `sheetApiUrl` as a dependency

  const validTeams = matchData.filter(
    (team) =>
      typeof team.team_name === "string" &&
      team.team_name.trim() !== "" &&
      !team.exclude
  );

  const sortedData = validTeams.sort((a: Team, b: Team) => {
    // First, sort by overall_points if available
    if (a.overall_points !== undefined && b.overall_points !== undefined) {
      if (a.overall_points > b.overall_points) return -1; // Sort descending by overall_points
      if (a.overall_points < b.overall_points) return 1;
    }

    // Sorting by Alive status:
    // - Alive teams come first
    // - Dead teams (Alive === 0) come below
    // - Missed teams (Alive === -1) come below dead teams

    if (a.Alive === -1 && b.Alive !== -1) return 1; // Missed team goes below
    if (a.Alive !== -1 && b.Alive === -1) return -1; // Alive team stays on top
    if (a.Alive === 0 && b.Alive !== 0) return 1; // Dead team goes below
    if (a.Alive !== 0 && b.Alive === 0) return -1; // Alive team stays on top

    return 0; // If both have same Alive status, no change in their relative order
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (sortedData.length === 0) {
    return <p>No match data available.</p>;
  }

  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, x: 1920 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative left-[1559px] top-[20px] ">
          <div
            className="bg-[#b31616] w-[430px] relative left-[px]  h-[36px] flex justify-around text-white text-[16px] items-center font-[montserrat] font-bold"
           
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${setupData?.SECONDARY_COLOR})` }}
          >
            <div className="relative left-[39px]">TEAM</div>
            <div className="relative left-[100px]">ALIVE</div>
            <div className="relative left-[65px]">KILLS</div>
            <div className="relative left-[20px]">TOTAL</div>
          </div>

          <div>
            {sortedData.map((team, index) => (
              <div
                style={{
                  opacity: setupData?.OPA,
                  borderColor: `linear-gradient(to left, ${primaryColor}, ${setupData?.SECONDARY_COLOR})`,
                 
                }}
                key={index}
               className={`w-[430px] h-[50px] flex font-oswald font-[400] border-b-2 ${
  index % 2 === 0 ? "bg-[#2f2f2f]" : "bg-[#1f1f1f]"
}`}
              >
                <div
                  style={{
                    opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1,
              
                  
                  }}
                  className={`text-white text-[25px] flex text-center justify-center items-center w-[60px] mt-[px]  `}
                >
                  {index + 1}
                </div>

                <div
                  className={`${
                    team.Alive === 0 ? "bg-[#ffffff00]" : "bg-[#fafafa00]"
                  } w-[170px] h-[50px] absolute left-[60px] flex justify-left text-black `}
                >
                  <div
                    style={{
                  
                      opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1,
                    }}
                    className="w-[50px] h-[50px] absolute z-10  "
                  >
               <Image
  src={team.team_logo?.startsWith("http")
    ? team.team_logo
    : team.team_logo || "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921117/orqtufih6h2efu2s24um.png"}
  alt="Team logo"
  width={64}
  height={64}
  unoptimized
/>
                  </div>
                
                  <div
                    className=" w-[200px] h-[500px] text-white  absolute left-[54px]  text-[25px] mt-[5px]"
                    style={{
                      opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1,
                    }}
                  >
                    {team.team_name}
                  </div>
                </div>

           <div className="absolute left-[240px] flex gap-[4px] mt-[7px] ">
  {team.Alive === -1 ? (
    <div
      style={{ opacity: team.Alive === -1 ? 0.5 : 1 }}
      className="text-white text-[20px] font-bold"
    >
      MISS
    </div>
  ) : team.Alive === 0 ? (
    <div className="relative w-[44px] h-[35px] flex items-center justify-between">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-[7px] h-[35px] bg-[#FF0000] opacity-70"></div>
      ))}
      <div className="absolute top-1/2 left-[-5px] w-[56px] h-[2px] bg-white opacity-80 transform -translate-y-1/2 skew-y-6"></div>
    </div>
  ) : (
    Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="w-[7px] h-[35px]"
        style={{
          backgroundColor:
            index < team.Alive ? `white` : "#FF0000",
        }}
      ></div>
    ))
  )}
</div>

                <div
                  className="absolute left-[300px] text-white text-[25px] mt-[-3px] flex items-center justify-center w-[50px] h-[50px]"
                  style={{
                    opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1, // Apply opacity for both dead and miss
                  }}
                >
                  {team.team_kills}
                </div>
                <div
                  className="absolute left-[364px] text-white  text-[25px] mt-[-3px] flex items-center justify-center w-[50px] h-[50px]"
                  style={{
                    opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1, // Apply opacity for both dead and miss
                  }}
                >
                  {team.overall_points}
                </div>
              </div>
            ))}
            <div
              style={{
                opacity: setupData?.OPA,
             
              
              }}
              className="w-[430px] h-[27px] bg-[#1a1a1a] absolute left-[0px] text-white  text-[16px] font-[montserrat] font-bold "
            >
              <div className="text-[14px] absolute left-[100px] mt-[3px] flex">
                ALIVE{" "}
                <div
                  
                  className=" w-[15px] h-[15px] ml-[10px] mt-[5px] bg-white" 
                ></div>
                <div className="flex ml-[70px]">
                  DEAD{" "}
                  <div
                    style={{ backgroundColor: "#FF0000" }}
                    className=" w-[15px] h-[15px] ml-[10px] mt-[5px]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStats;
