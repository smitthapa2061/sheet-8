// app/schedule/page.tsx
"use client";

import { div } from "framer-motion/client";
import React, { useEffect, useState } from "react";

type MatchData = {
  MATCH_NAME: string;
  MAP_NAME: string;
  IMAGE_LINK: string;
  CHECK_BOX: string;
  MATCH_NUMBER: string;
  MATCH_TIME: string;
  WWCD_TEAM: string;
  WWCD_TEAM_LOGO: string;
};

type SetupData = {
  ColumnB: string;
};

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const matchScheduleRange = "matchSchedule!A2:H6";
const setupRange = "setup!A2:B10";

const Schedule = () => {
  const [matchScheduleData, setMatchScheduleData] = useState<MatchData[]>([]);
  const [setupData, setSetupData] = useState<SetupData[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#cb201e");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${matchScheduleRange}?key=${apiKey}`
        );
        const matchJson = await matchRes.json();

        const filteredMatches = matchJson.values
          .filter((row: string[]) => row[3]?.toLowerCase() === "true")
          .map((row: string[]) => ({
            MATCH_NAME: row[0] || "",
            MAP_NAME: row[1] || "",
            IMAGE_LINK: row[2] || "",
            CHECK_BOX: row[3] || "",
            MATCH_NUMBER: row[4] || "",
            MATCH_TIME: row[5] || "",
            WWCD_TEAM: row[6] || "",
            WWCD_TEAM_LOGO: row[7] || "",
          }));

        setMatchScheduleData(filteredMatches);
      } catch (err) {
        console.error("Error fetching match schedule:", err);
      }

      try {
        const setupRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${setupRange}?key=${apiKey}`
        );
        const setupJson = await setupRes.json();

        const mappedSetup = setupJson.values.map((row: string[]) => ({
          ColumnB: row[1] || "",
        }));

        setSetupData(mappedSetup);
        setPrimaryColor(mappedSetup[5]?.ColumnB || "#cb201e");
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
    };

    fetchData();
  }, []);

  return (

  <div className="w-[1920px] h-[1080px] bg-green-400">

<div className="w-[70%] h-[70%] border-[8px] relative top-[140px]"></div>
<div 
className="w-[20px] h-[20px] bg-black absolute "
></div>


  </div>
  );
};

export default Schedule;
