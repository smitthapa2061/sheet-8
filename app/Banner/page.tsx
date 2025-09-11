"use client";
import React, { useState, useEffect } from "react";
import Dead from "../Stats/assets/deaed_logo.png";
import Image from "next/image";

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

interface Team {
  team_name: string;
  team_logo: string;
  Alive: number;
  team_kills: number;
  overall_points?: number;
  exclude?: boolean;
}

interface GoogleSheetData {
  values: [string, string][];
}

const apiKey = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

const Banner: React.FC = () => {
  const [matchData, setMatchData] = useState<Team[]>([]);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#b31616");
  const [lastValidData, setLastValidData] = useState<Team[]>([]);

  const url =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B12?key=${apiKey}`;

  // Fetch setup data once
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await fetch(sheetApiUrl);
        const data: GoogleSheetData = await response.json();
        const formattedData: Record<string, string> = {};
        data.values.forEach(([key, value]) => {
          formattedData[key.trim().toUpperCase().replace(/\s+/g, "_")] = value;
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
        setPrimaryColor(structured.PRIMARY_COLOR);
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
    };

    fetchSetupData();
  }, [sheetApiUrl]);

  // Fetch match data continuously with retry
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        if (!data.match_info || !Array.isArray(data.match_info)) {
          throw new Error("Invalid data format");
        }

        const uniqueData = data.match_info
          .filter((team: { player_rank: string }) => !team.player_rank)
          .reduce((acc: Team[], team: Team) => {
            if (!acc.some((item) => item.team_name === team.team_name)) {
              acc.push(team);
            }
            return acc;
          }, []);

        uniqueData.sort((a: Team, b: Team) => b.team_kills - a.team_kills);

        if (isMounted) {
          setMatchData(uniqueData);
          setLastValidData(uniqueData); // save last valid data
        }
      } catch (err) {
        console.error("Error fetching match data:", err);
        // Keep showing last valid data
        if (isMounted && lastValidData.length > 0) {
          setMatchData(lastValidData);
        }
      } finally {
        // Retry automatically after 7.5s
        if (isMounted) setTimeout(fetchData, 7500);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [lastValidData]);

  // Filter and sort for display
  const validTeams = matchData.filter(
    (team) => team.team_name && !team.exclude
  );

  const sortedData = validTeams.sort((a, b) => {
    if (a.overall_points !== undefined && b.overall_points !== undefined) {
      if (a.overall_points > b.overall_points) return -1;
      if (a.overall_points < b.overall_points) return 1;
    }

    if (a.Alive === -1 && b.Alive !== -1) return 1;
    if (a.Alive !== -1 && b.Alive === -1) return -1;
    if (a.Alive === 0 && b.Alive !== 0) return 1;
    if (a.Alive !== 0 && b.Alive === 0) return -1;
    return 0;
  });

  return (
    <div className="w-[1920px] h-[1080px] absolute top-[380px]">
      <div
        className="w-[1920px] h-[230px]"
        style={{
          backgroundImage: setupData?.BG_URL
            ? `url(${setupData.BG_URL})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: !setupData?.BG_URL ? "black" : undefined,
        }}
      >
        <div className="text-[2.2rem] absolute text-white font-bebas-neue bg-[#000000aa] pl-[30px] pr-[30px] left-[750px]">
          {setupData?.TOR_NAME} - {setupData?.ROUND} - DAY {setupData?.DAY}
        </div>
        <div
          className="w-[240px] h-[230px] ml-[20px]"
          style={{ backgroundColor: setupData?.PRIMARY_COLOR || "black" }}
        >
          <img src={setupData?.TOR_LOGO} alt="" />
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
                width: "350px",
              }}
              className="bg-[#393939] h-[50px] relative flex font-bebas-neue font-[300] border-b-2"
            >
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
              <div
                className={`${
                  team.Alive === 0 ? "bg-[#ffffff00]" : "bg-[#fafafa00]"
                } h-[50px] absolute left-[60px] flex justify-left text-black`}
                style={{ width: "170px" }}
              >
                <div
                  style={{ backgroundColor: setupData?.SECONDARY_COLOR }}
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
                <div className="text-[35px] w-[200px] h-[500px] absolute left-[54px]">
                  {team.team_name}
                </div>
              </div>
              <div className="absolute left-[240px] flex gap-[4px] mt-[7px] skew-y-6">
                {team.Alive === -1 ? (
                  <div className="text-white text-[20px] font-bold">MISS</div>
                ) : team.Alive === 0 ? (
                  <div className="w-[50px] h-[50px] absolute top-[-5px] opacity-[70%]">
                    <Image src={Dead.src} alt="Dead Icon" width={50} height={50} />
                  </div>
                ) : (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-[10px] h-[35px]"
                      style={{
                        backgroundColor:
                          idx < team.Alive ? setupData?.SECONDARY_COLOR : "#FF0000",
                      }}
                    ></div>
                  ))
                )}
              </div>
              <div className="absolute left-[300px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
                {team.team_kills}
              </div>
              <div className="absolute left-[364px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
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
