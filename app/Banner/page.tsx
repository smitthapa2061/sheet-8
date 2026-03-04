"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
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

const apiKey = "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";
const spreadsheetId = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

const Banner: React.FC = () => {
  const [matchData, setMatchData] = useState<Team[]>([]);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [overallData, setOverallData] = useState<Record<string, number>>({});
  const lastDataRef = useRef<string>("");
  const isFetchingRef = useRef(false);

  const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B12?key=${apiKey}`;
  const overallApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/overall1!A2:P100?key=${apiKey}`;
  const dataUrl =
    "https://script.google.com/macros/s/AKfycbwqAkBxAuEWkkIcBIne4vlycwOAL_4ESLzWzH_hZVNuZvL0F2m89uoHsLECgWctYkuA/exec";

  // Fetch setup data once
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await fetch(sheetApiUrl);
        const data: GoogleSheetData = await response.json();
        const formatted: Record<string, string> = {};
        data.values.forEach(([key, value]) => {
          formatted[key.trim().toUpperCase().replace(/\s+/g, "_")] = value;
        });
        const structured: SetupData = {
          TOR_NAME: formatted["TOR_NAME"] || "",
          TOR_LOGO: formatted["TOR_LOGO"] || "",
          ROUND: formatted["ROUND"] || "",
          DAY: formatted["DAY"] || "",
          MATCHES: formatted["MATCHES"] || "",
          PRIMARY_COLOR: formatted["PRIMARY_COLOR"] || "#b31616",
          SECONDARY_COLOR: formatted["SECONDARY_COLOR"] || "#000",
          TEXT_COLOR_1: formatted["TEXT_COLOR_1"] || "#fff",
          TEXT_COLOR_2: formatted["TEXT_COLOR_2"] || "#fff",
          BG_URL: formatted["BG_URL"] || "",
        };
        setSetupData(structured);
      } catch (err) {
        console.error("Setup fetch failed:", err);
      }
    };
    fetchSetupData();
  }, [sheetApiUrl]);

  // Fetch overall data once
  useEffect(() => {
  let isMounted = true;

  const fetchOverallData = async () => {
    try {
      const response = await fetch(overallApiUrl);
      const data = await response.json();

      if (data.values && Array.isArray(data.values)) {
        const overallMap: Record<string, number> = {};

        data.values.forEach((row: string[]) => {
          if (row[0]) {
            const teamName = row[0].trim();
            const totalPoints = row[2]
              ? parseInt(row[2], 10) || 0
              : 0;

            overallMap[teamName] = totalPoints;
          }
        });

        if (isMounted) {
          setOverallData(overallMap);
        }
      }
    } catch (err) {
      console.error("Overall fetch failed:", err);
    }
  };

  // Fetch immediately
  fetchOverallData();

  // Then poll every 3 minutes
  const interval: NodeJS.Timeout = setInterval(fetchOverallData, 100000); // 3 mins

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [overallApiUrl]);

  // Fetch match data continuously with hash-based deduplication
  useEffect(() => {
    let isMounted = true;
    let retryDelay = 7500;

    const fetchData = async () => {
      if (isFetchingRef.current) {
        if (isMounted) setTimeout(fetchData, 1000);
        return;
      }

      isFetchingRef.current = true;

      try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        
        if (!data.match_info || !Array.isArray(data.match_info))
          throw new Error("Invalid data format");

        // Create hash to check if data actually changed
        const dataHash = JSON.stringify(
          data.match_info.map((t: Team) => ({
            n: t.team_name,
            k: t.team_kills,
            a: t.Alive,
            o: t.overall_points,
          }))
        );

        // Skip update if data hasn't changed
        if (dataHash === lastDataRef.current) {
          isFetchingRef.current = false;
          if (isMounted) setTimeout(fetchData, retryDelay);
          return;
        }

        lastDataRef.current = dataHash;

        const uniqueData: Team[] = data.match_info
          .filter((team: { player_rank: string }) => !team.player_rank)
          .reduce((acc: Team[], team: Team) => {
            if (!acc.some((item) => item.team_name === team.team_name)) {
              const processedTeam: Team = {
                ...team,
                Alive: typeof team.Alive === 'string' ? parseInt(team.Alive, 10) || 0 : (team.Alive || 0),
                team_kills: typeof team.team_kills === 'string' ? parseInt(team.team_kills, 10) || 0 : (team.team_kills || 0),
                overall_points: typeof team.overall_points === 'string' ? parseInt(team.overall_points, 10) : team.overall_points,
              };
              acc.push(processedTeam);
            }
            return acc;
          }, []);

        uniqueData.sort((a, b) => b.team_kills - a.team_kills);

        if (isMounted) {
          setMatchData(uniqueData);
          retryDelay = 7500;
        }
      } catch (err) {
        console.error("Match fetch failed:", err);
        retryDelay = Math.min(retryDelay * 2, 60000);
      } finally {
        isFetchingRef.current = false;
        if (isMounted) setTimeout(fetchData, retryDelay);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [dataUrl]);

  // Memoize sorted data to prevent unnecessary recalculations
  const sortedData = useMemo(() => {
    const validTeams = matchData.filter(
      (team) => team.team_name && !team.exclude
    );

    return validTeams.sort((a, b) => {
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
  }, [matchData]);

  // Memoize team rows to prevent unnecessary re-renders
  const teamRows = useMemo(() => {
    return sortedData.map((team, index) => ({
      team,
      index,
      isDead: team.Alive === 0,
      isMiss: team.Alive === -1,
      aliveBars: team.Alive > 0 ? Math.min(team.Alive, 4) : 0,
    }));
  }, [sortedData]);

  return (
    <div className="w-[1920px] h-[1080px] absolute top-[380px]">
      <div
        className="w-[1920px] h-[230px]"
        style={{
          backgroundImage: setupData?.BG_URL
            ? `linear-gradient(to right, ${setupData.PRIMARY_COLOR || '#000'}, #000 40%, #000 60%, ${setupData.SECONDARY_COLOR || '#000'}), url(${setupData.BG_URL})`
            : `linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.5)), linear-gradient(to right, ${setupData?.PRIMARY_COLOR || '#b31616'}, #000 40%, #000 60%, ${setupData?.SECONDARY_COLOR || '#000000'})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-[2.2rem] absolute text-white font-bebas-neue bg-[#000000aa] pl-[30px] pr-[30px] left-[750px]">
          {setupData?.TOR_NAME} - {setupData?.ROUND} 
        </div>
    <div
  className="w-[240px] h-[230px] ml-[20px]"
  style={{
    backgroundImage: `linear-gradient(45deg, #323232 0%, #dadada 30%,  #ffffff 100%, #181818 100%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  }}
>
  <img src={setupData?.TOR_LOGO || "/def_logo.avif"} alt="" />
</div>

        <div className="w-[2500px] flex flex-wrap justify-start items-start gap-x-[10px] gap-y-[10px] px-[120px] py-[10px] scale-75 absolute left-[-120px] top-[13px]">
          {teamRows.map(({ team, index, isDead, isMiss, aliveBars }) => (
            <div
              key={`${team.team_name}-${index}`}
              style={{
                borderColor: setupData?.PRIMARY_COLOR,
                clipPath:
                  "polygon(0% 0%, 100% 0%, 100% 100%, 4% 100%, 0% 80%, 0% 90%)",
                opacity: isDead || isMiss ? 0.5 : 1,
                width: "350px",
              }}
              className="bg-[#0d0d0d] h-[50px] relative flex font-bebas-neue font-[300] border-b-2 border-t-2 border-r-2"
            >
              <div
                style={{
                  backgroundColor: setupData?.PRIMARY_COLOR,
                  clipPath:
                    "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 30% 30%, 0% 60%)",
                }}
                className="text-white text-[35px] flex text-center justify-center items-center w-[50px]"
              >
                {index + 1}
              </div>
              <div
                className={
                  isDead ? "bg-[#ffffff00]" : "bg-[#fafafa00]"
                }
                style={{ width: "170px", height: "50px" }}
              >
                <div
                
                  className="w-[50px] h-[50px] absolute z-10 border-r-[2px] border-black bg-white"
                >
                  <Image
                    src={
                      team.team_logo ||
                      "/def_logo.avif"
                    }
                    alt="Team Logo"
                    width={50}
                    height={50}
                  />
                </div>
              
                <div className="text-[35px] w-[100px] h-[500px] absolute left-[95px] bg-white pl-[10px]">
                  {team.team_name}
                </div>
              </div>
           <div className="absolute left-[200px] flex gap-[4px] mt-[7px] ">
  {isMiss ? (
    <div className="text-white text-[20px] font-bold">MISS</div>
  ) : (
    Array.from({ length: 4 }).map((_, idx) => {
      const isBarAlive = idx < aliveBars;

      return (
        <div
          key={idx}
          className="w-[10px] h-[35px] "
          style={{
            backgroundImage: isBarAlive
              ? `linear-gradient(to bottom, ${setupData?.PRIMARY_COLOR || '#b31616'} 100%, white 50%, ${setupData?.SECONDARY_COLOR || '#000'} 100%)`
              : "linear-gradient(to bottom, #FF0000 100%, white 20%, #FF0000 100%)",
            boxShadow: isBarAlive
              ? `inset 0 2px 4px rgba(255, 255, 255, 0.5)`
              : `inset 0 2px 4px rgba(255, 255, 255, 0.7)`,
            border: "0.1px solid #ffffff9c",
          }}
        />
      );
    })
  )}
</div>
              <div className="absolute left-[250px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
                {team.team_kills}
              </div>
             <div className="absolute left-[300px] text-white text-[35px] mt-[1px] flex items-center justify-center w-[50px] h-[50px]">
             {overallData[team.team_name] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
