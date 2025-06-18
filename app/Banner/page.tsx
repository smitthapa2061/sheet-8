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
  BG_URL: string;
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

const Banner: React.FC = () => {
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
    BG_URL: formattedData["BG_URL"] || "",

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
    <div className="w-[1920px] h-[1080px] absolute top-[380px] ">
   
    <div
  className="w-[1920px] h-[230px]"
  style={{
    backgroundImage: setupData?.BG_URL ? `url(${setupData.BG_URL})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: !setupData?.BG_URL ? "black" : undefined,
  }}
>
 

  <div className="w-[100%] h-[20px] absolute left-[750px] ">
<div className="text-[2.2rem] absolute text-white font-bebas-neue bg-[#000000aa] pl-[30px] pr-[30px]">{setupData?.TOR_NAME} - {setupData?.ROUND} -  DAY  {setupData?.DAY} - MATCH {setupData?.MATCHES}</div>
</div>
<div
  style={{
    backgroundColor: setupData?.PRIMARY_COLOR || "black",
  }}
className="w-[240px] h-[230px] ml-[20px]">

 

  <img src= {setupData?.TOR_LOGO} alt="" />
  
</div>
<div className="w-[2500px] flex flex-wrap justify-start items-start gap-x-[10px] gap-y-[10px] px-[120px] py-[10px] scale-75 absolute left-[-120px] top-[13px]">
  {sortedData.map((team, index) => (
    <div
      key={index}
      style={{
        borderColor: setupData?.PRIMARY_COLOR,
        clipPath:
          "polygon(0% 0%, 100% 0%, 100% 100%, 4% 100%, 0% 80%, 0% 90%)",
        opacity: team.Alive === 0 || team.Alive === -1 ? 0.5 : 1,
        width: "350px", // set width to fit 4 columns with 10px gap in ~1000px container
      }}
      className="bg-[#393939] h-[50px] relative flex font-bebas-neue font-[300] border-b-2"
    >
      {/* Rank */}
      <div
        style={{
          backgroundColor: setupData?.PRIMARY_COLOR,
          clipPath:
            "polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%, 30% 30%, 0% 60%)",
        }}
        className="text-white text-[35px] flex text-center justify-center items-center w-[60px]"
      >
        {index + 1}
      </div>

      {/* Team logo and name container */}
      <div
        className={`${
          team.Alive === 0 ? "bg-[#ffffff00]" : "bg-[#fafafa00]"
        } h-[50px] absolute left-[60px] flex justify-left text-black`}
        style={{ width: "170px" }} // keep fixed width here
      >
        <div
          style={{
            backgroundColor: setupData?.SECONDARY_COLOR,
          }}
          className="w-[50px] h-[50px] absolute z-10 border-r-[2px] border-black"
        >
          <Image
            src={
              team.team_logo ||
              "https://res.cloudinary.com/dqckienxj/image/upload/v1727161652/default_nuloh2.png"
            }
            alt="Team Logo"
            width={50}
            height={50}
          />
        </div>
        <div className="bg-white w-[120px] h-[80px] absolute left-[50px] top-[0px]"></div>
        <div
          className="text-[35px] w-[200px] h-[500px] absolute left-[54px]"
        >
          {team.team_name}
        </div>
      </div>

      {/* Alive indicators */}
      <div className="absolute left-[240px] flex gap-[4px] mt-[7px] skew-y-6">
        {team.Alive === -1 ? (
          <div className="text-white text-[20px] font-bold">MISS</div>
        ) : team.Alive === 0 ? (
          <div className="w-[50px] h-[50px] absolute top-[-5px] opacity-[70%]">
            <Image
              src={Dead.src as string}
              alt="Dead Icon"
              width={50}
              height={50}
            />
          </div>
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-[10px] h-[35px]"
              style={{
                backgroundColor:
                  index < team.Alive
                    ? `${setupData?.SECONDARY_COLOR}`
                    : "#FF0000",
              }}
            ></div>
          ))
        )}
      </div>

      {/* Kills */}
      <div
        className="absolute left-[300px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]"
      >
        {team.team_kills}
      </div>

      {/* Points */}
      <div
        className="absolute left-[364px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]"
      >
        {team.overall_points}
      </div>
    </div>
  ))}
</div>

</div>
          
   
     
    </div>
  );
};

export default Banner;