"use client";

import React, { useEffect, useState } from "react";

/* ---------------- Interfaces ---------------- */

interface TeamData {
  pos: number;
  team: string;
  mp: number;
  kp: number;
  pp: number;
  tt: number;
  cd: string;
}

interface SetupData {
  ColumnB: string;
}

/* ---------------- Component ---------------- */

const PointsTable = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [setupData, setSetupData] = useState<SetupData[]>([]);
  const [page, setPage] = useState(0);

  const itemsPerPage = 10;

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";

  const spreadsheetId =
    process.env.NEXT_PUBLIC_SPREADSHEET_ID ||
    "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

  /* ---------------- Fetch Data ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Data1!A2:G50?key=${apiKey}`
        );

        const data = await res.json();
        const values = data?.values ?? [];

        const mapped: TeamData[] = values.map((row: string[]) => ({
          pos: Number(row[0]) || 0,
          team: row[1] || "Unknown",
          mp: Number(row[2]) || 0,
          kp: Number(row[3]) || 0,
          pp: Number(row[4]) || 0,
          tt: Number(row[5]) || 0,
          cd: row[6] || "",
        }));

        mapped.sort((a, b) => {
          if (b.tt !== a.tt) return b.tt - a.tt;
          if (b.pp !== a.pp) return b.pp - a.pp;
          if (b.kp !== a.kp) return b.kp - a.kp;
          return b.mp - a.mp;
        });

        setTeams(mapped);

        const res2 = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Setup!A2:B20?key=${apiKey}`
        );

        const data2 = await res2.json();
        const values2 = data2?.values ?? [];

        setSetupData(
          values2.map((row: string[]) => ({
            ColumnB: row[1] || "",
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [apiKey, spreadsheetId]);

  /* ---------------- Pagination ---------------- */

  const totalPages = Math.ceil(teams.length / itemsPerPage);

  const visibleTeams = teams.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  /* ---------------- Setup ---------------- */

  const title = setupData[0]?.ColumnB || "OVERALL RANKING";
  const matchName = setupData[2]?.ColumnB || "MATCH";
  const day = setupData[3]?.ColumnB || "1";
  const primaryColor = setupData[5]?.ColumnB || "#ff2d2d";
  const backgroundImage = setupData[9]?.ColumnB || "";

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col items-center gap-6 bg-black">

      {/* 1080x1080 Canvas */}
      <div
        className="w-[1080px] h-[1080px] relative overflow-hidden font-[teko] "
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 " />

        {/* Header */}
        <div className="absolute top-[40px] w-full flex flex-col items-center z-10">

          <div className="text-black text-[60px] font-[800] ">
            {title}
          </div>

          <div
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, black)`
            }}
            className="px-6 py-1 text-white text-[30px] font-[700] mt-[-10px] "
          >
            {matchName} 
          </div>
        </div>

        {/* Table Box */}
        <div className="absolute top-[180px] left-[40px] w-[1000px] bg-black/60  border border-white/10 rounded-xl p-6 z-10">

          {/* Header Row */}
          <div
            style={{ borderBottom: `3px solid ${primaryColor}` }}
            className="flex items-center text-white text-[26px] font-[700] pb-3 relative left-[-15px]"
          >
            <div className="w-[80px]">#</div>
            <div className="flex-1">TEAM</div>
            <div className="w-[90px] text-center">pp</div>
            <div className="w-[90px] text-center">KP</div>
            <div className="w-[90px] text-center">TP</div>
            <div className="w-[90px] text-center">CD</div>
           
          </div>

          {/* Rows */}
          <div className="mt-4 space-y-2">

            {visibleTeams.map((team, index) => {

              const isTop3 = team.pos <= 15;

              return (
                <div
                  key={index}
                  className="flex items-center text-white text-[26px] py-3 px-4 rounded-lg border border-white/5"
                  style={{
                    background: isTop3
                      ? `linear-gradient(90deg, ${primaryColor}50, transparent)`
                      : "transparent"
                  }}
                >
                  {/* Position */}
                  <div
                
                    className="w-[80px] font-[800]"
                  >
                    {team.pos}
                  </div>

                  {/* Team */}
                  <div className="flex-1 font-[600] tracking-wide">
                    {team.team.toUpperCase()}
                  </div>

                  {/* Stats */}
               
                  <div className="w-[90px] text-center">{team.kp}</div>
                  <div className="w-[90px] text-center">{team.pp}</div>

                  <div
                  
                    className="w-[90px] text-center font-[800]"
                  >
                    {team.tt}
                  </div>

                  <div className="w-[90px] text-center">{team.cd}</div>
                </div>
              );
            })}
          </div>
        </div>

    
      </div>

      {/* Page Buttons */}
      <div className="flex gap-6">

        <button
          onClick={() => setPage(0)}
          className={`px-8 py-2 rounded-lg font-[700] transition ${
            page === 0
              ? "bg-red-600 text-white"
              : "bg-black text-white border border-white/20"
          }`}
        >
          Page 1
        </button>

        <button
          onClick={() => setPage(1)}
          className={`px-8 py-2 rounded-lg font-[700] transition ${
            page === 1
              ? "bg-red-600 text-white"
              : "bg-black text-white border border-white/20"
          }`}
        >
          Page 2
        </button>
           <button
          onClick={() => setPage(2)}
          className={`px-8 py-2 rounded-lg font-[700] transition ${
            page === 2
              ? "bg-red-600 text-white"
              : "bg-black text-white border border-white/20"
          }`}
        >
          Page 3
        </button>

      </div>
    </div>
  );
};

export default PointsTable;