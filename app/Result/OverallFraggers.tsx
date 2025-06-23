import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";

// Define types for the fragger data and setup data
interface FraggerData {
  team_name: string;
  team_logo: string;
  player_name: string;
  player_photo: string;
  player_kills: number;
  player_matches: number;
  kd_ratio: number;
  contribution: number;
}

interface SetupData {
  ColumnB: string;
}

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const range = "overall1!A2:O200"; // Range you want to fetch (adjust this as needed)
const range2 = "setup!A2:B10"; // Another range for setup data

const Fragger: React.FC = () => {
  const [data, setData] = useState<FraggerData[]>([]); // State for fragger data
  const [data2, setData2] = useState<SetupData[]>([]); // State for setup data
  const [error, setError] = useState<string | null>(null); // Error state
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(); // State for primary color

  console.log(primaryColor, "primary");

  useEffect(() => {
    // Fetching fragger data
    const fetchFraggerData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        const response = await axios.get<{ values: string[][] }>(url); // Type for the response
        const values = response.data.values || [];

        // Format the fragger data
        const formattedData: FraggerData[] = values.map((row) => ({
          team_name: row[0] || "name", // Column 0 - Team Name (e.g., "4BS")
          team_logo:
            row[1] ||
            "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png", // Column 1 - Team Logo (e.g., logo URL)
          player_name: row[6] || "Unknown", // Column 6 - Player Name (e.g., "PLAYER 6")
          player_photo:
            row[8] ||
            "https://res.cloudinary.com/dqckienxj/image/upload/v1727161666/defult_chach_apsjhc.png", // Column 8 - Player Photo URL
          player_kills: Number(row[7]) || 0, // Column 7 - Player Kills (e.g., 12)
          player_matches: Number(row[14]) || 0, // Column 14 - Matches Played (e.g., 1)
          kd_ratio: Number(row[5]) || 0, // Column 5 - K/D Ratio (e.g., 12)
          contribution: Number(row[10]) || 0, // Column 10 - Contribution (e.g., 35.3)
        }));

        // Sort data by player_kills, then kd_ratio, and then contribution
        const sortedData = formattedData
          .sort((a, b) => {
            if (b.player_kills !== a.player_kills) {
              return b.player_kills - a.player_kills; // Sort by player_kills descending
            }
            if (b.kd_ratio !== a.kd_ratio) {
              return b.kd_ratio - a.kd_ratio; // Sort by kd_ratio descending
            }
            return b.contribution - a.contribution; // Sort by contribution descending
          })
          .slice(0, 5); // Get top 5

        setData(sortedData); // Set fragger data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    // Fetching setup data
    const fetchSetupData = async () => {
      try {
        const url2 = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?key=${apiKey}`;
        const response2 = await axios.get<{ values: string[][] }>(url2); // Type for the response
        const values2 = response2.data.values || [];

        // Prepare setup data
        const formattedData2: SetupData[] = values2.map((row) => ({
          ColumnB: row[1] || "", // Column B
        }));

        setData2(formattedData2); // Set setup data

        // Set primary color if it's available
        setPrimaryColor(formattedData2[5]?.ColumnB || "#FF0000"); // Update primary color state
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchFraggerData(); // Call to fetch fragger data
    fetchSetupData(); // Call to fetch setup data
  }, []); // Empty dependency array to run once on mount

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Fade out on exit
      transition={{ duration: 2 }}
    >
      <div className="w-[1920px] h-[1080px] flex font-[teko] font-[500] ">
        <div className="text-white text-[150px] absolute left-[70px] top-[-20px]">
          OVERALL FRAGGERS
        </div>

        {/* Display match info from setup data */}
        {data2.length > 5 && (
          <div
            className="absolute top-[170px] left-[70px] text-white bg-red-800 pl-4 pr-4 text-center"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            <div className="text-[40px] font-[orbitron] font-[800] tracking-wider">
              {data2[2]?.ColumnB} | DAY - {data2[3]?.ColumnB} | MATCH -{" "}
              {data2[4]?.ColumnB}
            </div>
          </div>
        )}

        {/* Fragger data */}
        <div className="flex flex-wrap justify-center space-x-4">
          {data.map((row, index) => (
            <motion.div
              className="flex mb-[20px] relative left-[35px] top-[270px]"
              key={index}
              initial={{ opacity: 0, y: 550 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.2,
              }} // Staggered animation
            >
              <div
                className="bg-[#000000bb] border-solid border-red-800 w-[340px] h-[492px] mr-[20px] border-[2px]"
                style={{
                  borderColor: primaryColor,
                }}
              >
                <div className="w-[100px] h-[100px] mb-[-100px] relative left-[240px]">
                  <Image
                    src={row.team_logo}
                    alt="Team Logo"
                    width={120} // specify the width
                    height={120} // specify the height
                  />
                </div>
                <div className="text-white mb-[-90px] text-[60px] ml-[10px] relative bottom-[10px]">
                  {index + 1}
                </div>
                <div className="text-white w-[490px] relative right-[80px] top-[0px] mb-[400px]">
                  <Image
                    src={
                      !row.player_photo || row.player_photo === "#N/A"
                        ? "https://res.cloudinary.com/dqckienxj/image/upload/v1735762279/defult_chach_apsjhc_dwnd7n.png"
                        : row.player_photo
                    }
                    alt="Player"
                    width={800}
                    height={800}
                    className="object-cover absolute"
                  />
                </div>
                <div className="w-[100%] bg-white h-[80px] relative top-[10px]">
                  <div
                    className="text-[80px] relative bottom-[15px] text-center text-red-800"
                    style={{
                      color: primaryColor,
                    }}
                  >
                    {row.player_name}
                  </div>
                </div>
                <div
                  className="bg-red-800 w-[100%] h-[230px] text-white text-[60px]"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  <div className="relative bottom-[-10px]">
                    <div className="ml-[8px] relative top-[-10px] flex">
                      <div> KILLS</div>
                      <div className="bg-black w-[90px] h-[60px] relative left-[140px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                        <div className="text-center top-[-12px] relative ">
                          {row.player_kills}
                        </div>
                      </div>
                    </div>
                    <div className="w-[65%] h-[1px] bg-white relative left-[10px] top-[-28px]"></div>
                    <div className="ml-[8px] relative top-[-30px] flex">
                      <div className="text-[50px] relative top-[8px] ">
                        K/D RATIO
                      </div>
                      <div className="bg-black w-[90px] h-[60px] absolute left-[240px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                        <div className="text-center top-[-12px] relative ">
                          {row.kd_ratio.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="w-[65%] h-[1px] bg-white relative left-[10px] top-[-28px]"></div>
                    <div className="ml-[8px] relative top-[-30px] flex">
                      <div className="text-[50px] relative top-[8px]">
                        CONTRIBUTION
                      </div>
                      <div className="bg-black w-[90px] h-[60px] absolute left-[240px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                        <div className="text-center top-[3px] text-[35px] relative ">
                          {row.contribution}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white w-[80%] h-[30px] relative left-[30px]">
                  <div className="relative text-center text-[20px] font-[orbitron] font-extrabold">
                    TEAM {row.team_name}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Fragger;
