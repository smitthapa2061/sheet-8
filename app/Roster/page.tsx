"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image from next/image

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const range = "match1!A2:N102"; // Fetching all columns but using only A, B, G
const range2 = "setup!A2:B10"; // Another range for setup data

interface MatchDataType {
  [team: string]: {
    logo: string;
    players: string[];
  };
}

const MatchData: React.FC = () => {
  const [data, setData] = useState<(string | undefined)[][]>([]); // Data from the match sheet
  const [primaryColor, setPrimaryColor] = useState<string>("#FF0000"); // Default color (red)
  const [currentDataIndex, setCurrentDataIndex] = useState<number>(0); // Track current index for pagination

  const itemsPerPage = 4; // Number of items per page

  // Fetch both match data and setup data
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        const result = await response.json();

        if (result.values) {
          const teams: MatchDataType = {};

          result.values.forEach((row: string[]) => {
            const team = row[0]?.trim(); // Column A (Team Name)
            const logoUrl = row[1]?.trim(); // Column B (Logo URL)
            const player = row[6]?.trim(); // Column G (Player Name)

            if (team && player) {
              if (!teams[team]) {
                teams[team] = { logo: logoUrl, players: [] };
              }
              teams[team].players.push(player); // Keep duplicate players
            }
          });

          const formattedData = Object.entries(teams).map(
            ([team, { logo, players }]) => [
              team,
              logo, // Add the logo URL for each team
              ...players,
            ]
          );

          setData(formattedData); // Set the match data
        }
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    const fetchSetupData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?key=${apiKey}`
        );
        const result = await response.json();

        if (result.values) {
          const color = result.values[5]?.[1]?.trim(); // Primary color from row 6, column 2
          if (color) {
            setPrimaryColor(color); // Set the primary color from setup range
          }
        }
      } catch (error) {
        console.error("Error fetching setup data:", error);
      }
    };

    // Fetch both match and setup data
    fetchMatchData();
    fetchSetupData();
  }, []);

  useEffect(() => {
    // Automatically change the current set of 4 items every 5 seconds
    const interval = setInterval(() => {
      setCurrentDataIndex((prevIndex) => {
        if (prevIndex + itemsPerPage >= data.length) {
          return 0; // Reset to the first set of data if we're at the end
        }
        return prevIndex + itemsPerPage;
      });
    }, 15000); // Change every 15 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className="w-[1920px] h-[1080px]">
      <h2 className="text-white font-teko font-[700] absolute text-[150px] top-[20px] left-[550px]">
        SQUAD ROSTER
      </h2>
      <div className="match-table">
        <div className="flex">
          {data
            .slice(currentDataIndex, currentDataIndex + itemsPerPage)
            .map((row, index) => (
              <motion.div
                key={`${currentDataIndex}-${index}`} // Add currentDataIndex to key to re-trigger animation
                className="w-[570px] h-[500px] mt-[280px] justify-center flex"
                initial={{ opacity: 0, y: 550 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.2, // Staggered animation
                }}
              >
                <div className="">
                  <div className="w-[350px] h-[350px] bg-[#000000bb]">
                    <Image
                      src={
                        row[1] ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      alt="Team Logo"
                      width={350}
                      height={350}
                      className="w-[100%] h-[100%]"
                    />
                    <div className="text-black bg-white text-[50px] font-bebas-neue w-[350px] h-[60px] absolute flex justify-center">
                      <div style={{ color: primaryColor }}> TEAM {row[0]}</div>
                    </div>
                  </div>
                  <div
                    className="mt-[60px] w-[100%]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {row.slice(2).map((player, index) => (
                      <div
                        key={index}
                        className="text-white font-bebas-neue w-[100%] justify-center flex mb-[-20px] text-[50px]"
                      >
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MatchData;
