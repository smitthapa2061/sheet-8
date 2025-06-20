"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Import the Image component from Next.js

// Define types for the data structures
interface Team {
  team_name: string;
  team_logo: string;
  Alive: number;
  wwcd_chance: number;
  team_kills: number; // Add team_kills to match the data structure
}
const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const setupRange = "setup!A2:B10"; // Range for setup data (like primary color)
const displayRange = "display!A21:B37"; // Range for visibility check (including B27)

const UpperStats: React.FC = () => {
  const [matchData, setMatchData] = useState<Team[]>([]);
  const [primaryColor, setPrimaryColor] = useState<string>("#ff0000"); // Default primary color
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true); // State to manage visibility

  const matchDataUrl =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const setupDataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${setupRange}?key=${apiKey}`;
  const displayDataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${displayRange}?key=${apiKey}`;

  // Fetch the setup data (sheet data) for primary color
  const fetchSetupData = async () => {
    try {
      const response = await fetch(setupDataUrl);
      const data = await response.json();

      if (data && data.values && data.values.length > 0) {
        // Find the row that contains "PRIMARY COLOR"
        const primaryColorRow = data.values.find(
          (row: string[]) => row[0] === "PRIMARY COLOR"
        );
        if (primaryColorRow) {
          setPrimaryColor(primaryColorRow[1] || "#ff0000"); // Set primary color from sheet
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching setup data:", err);
      setError((err as Error).message); // Cast 'err' to 'Error'
    }
  };

  // Fetch the display data for visibility check (cell B27)
  const fetchDisplayData = async () => {
    try {
      const response = await fetch(displayDataUrl);
      const data = await response.json();

      if (data && data.values && data.values.length > 0) {
        // Find the row that contains "Upper Stats"
        const upperStatsRow = data.values.find(
          (row: string[]) => row[0] === "Upper Stats"
        );

        if (upperStatsRow && upperStatsRow[1] === "TRUE") {
          setIsVisible(true); // Set to true if the value is "TRUE"
        } else {
          setIsVisible(false); // Set to false otherwise
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching display data:", err);
      setError((err as Error).message); // Cast 'err' to 'Error'
    }
  };

  // Fetch the match data
  const fetchMatchData = async () => {
    try {
      const response = await fetch(matchDataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        const uniqueData = data.match_info.reduce((acc: Team[], team: Team) => {
          if (!acc.some((item) => item.team_name === team.team_name)) {
            acc.push(team);
          }
          return acc;
        }, []);

        uniqueData.sort((a: Team, b: Team) => b.team_kills - a.team_kills); // Sort teams by team kills

        // Show only teams with Alive >= 1 and non-empty team names
        const aliveTeams = uniqueData.filter(
          (team: Team) => team.Alive >= 1 && team.team_name !== ""
        );

        // Limit to top 5 teams
        setMatchData(aliveTeams.slice(0, 5)); // Take only the first 5 teams
      }
    } catch (err: unknown) {
      setError((err as Error).message); // Cast 'err' to 'Error'
    }
  };

  useEffect(() => {
    fetchMatchData();
    fetchSetupData();
    fetchDisplayData(); // Fetch visibility state initially

    // Fetch data every 6 seconds for match data
    const matchDataIntervalId = setInterval(fetchMatchData, 6500);

    // Fetch visibility data every 20 seconds
    const displayDataIntervalId = setInterval(fetchDisplayData, 60000);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(matchDataIntervalId);
      clearInterval(displayDataIntervalId);
    };
  }, []); // Empty dependency array to ensure the effect runs only once on mount

  if (error) return <p>{error}</p>;

  if (!isVisible) return null; // Do not render if visibility is false

  return (
    <div className="w-[1920px] h-[1080px]">
      <div className="flex gap-[120px] w-full h-[80px] font-bebas-neue font-[300] justify-center scale-75 ml-[-20px]">
        {matchData.map((team, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -1080 }} // Start off-screen (top)
            animate={{ opacity: 1, y: 0 }} // Fade in and move to its position
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center h-[90px] w-[330px] p-2 top-[40px] relative bg-white"
          >
            {/* Team Logo */}
            <div className="w-[80px] h-[80px]">
              <Image
                src={
                  team.team_logo ||
                  "https://res.cloudinary.com/dqckienxj/image/upload/v1727161652/default_nuloh2.png"
                }
                alt="team logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Team Name */}
            <div className="text-[70px] ml-[10px]">{team.team_name}</div>
            <div className="bg-black w-[140px] absolute h-[90px] left-[250px] ml-[0px] border-solid border-[2px] border-white">
              {/* Alive Count */}
              <div className="flex gap-[7px] relative left-[20px] top-[10px]">
                {Array.from({ length: Math.min(team.Alive, 4) }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="w-[20px] h-[70px] bg-red-800"
                      style={{
                        backgroundColor: primaryColor, // Dynamically using fetched primaryColor
                      }}
                    ></div>
                  )
                )}
              </div>
            </div>
            <div
              className="bg-red-800 w-[390px] h-[80px] absolute top-[100px] left-[0px] right-[0px]"
              style={{ backgroundColor: primaryColor }} // Dynamically using fetched primaryColor
            >
              <div className="text-white text-[52px] absolute ml-[40px] mt-[-0px]">
                WWCD CHANCE{" "}
                <span className="relative left-[20px]">
                  {team.wwcd_chance}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UpperStats;
