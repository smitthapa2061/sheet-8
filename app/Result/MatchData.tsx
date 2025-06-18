import React, { useState, useEffect } from "react";
import Image from "next/image"; // Import Next.js Image component

import axios from "axios";
import { motion } from "framer-motion";

// Define types for team and setup data
type Team = {
  team_name: string;
  total_points: number;
  team_position: number;
  team_kills: number;
  team_logo: string;
  player_photos: string[];
  chicken: number;
  player_rank?: number;
  player_logo?: string;
  exclude: boolean; // <<< Add this line
};

type SetupData = {
  ColumnB: string;
};

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";

const MatchData: React.FC = () => {
  const [matchData, setMatchData] = useState<Team[]>([]); // Store match data
  const [setupData, setSetupData] = useState<SetupData[]>([]); // State for setup sheet data
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const urlMatchData =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const urlSetupData = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B10?key=${apiKey}`;

  // Define the response type for the axios request
  interface MatchDataResponse {
    match_info: Team[];
  }

  interface SetupDataResponse {
    values: string[][];
  }

  useEffect(() => {
    // Fetch match data
    axios
      .get<MatchDataResponse>(urlMatchData)
      .then((response) => {
        const data = response.data.match_info;

        // Remove duplicates based on team_name and filter out rows with player_rank
        const uniqueData = data
          .filter((team) => !team.exclude) // Exclude rows where player_rank is truthy
          .reduce<Team[]>((acc, team) => {
            const existingTeam = acc.find(
              (item) => item.team_name === team.team_name
            );

            if (!existingTeam) {
              acc.push(team);
              if (team.total_points) {
                team.player_photos = [team.player_logo || ""];
              }
            } else {
              if (team.total_points) {
                if (!existingTeam.player_photos) {
                  existingTeam.player_photos = [];
                }
                existingTeam.player_photos.push(team.player_logo || "");
              }
            }
            return acc;
          }, []);

        uniqueData.sort((a, b) => b.total_points - a.total_points);
        setMatchData(uniqueData);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data.");
        setLoading(false);
      });

    // Fetch setup data
    axios
      .get<SetupDataResponse>(urlSetupData)
      .then((response) => {
        const setupValues = response.data.values;

        if (setupValues) {
          const formattedSetupData = setupValues.map((row: string[]) => ({
            ColumnB: row[1] || "",
          }));
          setSetupData(formattedSetupData);
        }
      })
      .catch(() => {
        setError("Error fetching setup data.");
        setLoading(false);
      });
  }, [urlSetupData]); // Add urlSetupData to the dependency array

  useEffect(() => {
    if (currentPage === 1) {
      const timer = setTimeout(() => {
        setCurrentPage(2);
      }, 40000);

      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [currentPage]);

  const pageData =
    currentPage === 1
      ? matchData.filter(
          (team, index) => index >= 5 && index <= 13 && team.team_name
        )
      : matchData.filter(
          (team, index) => index >= 14 && index <= 24 && team.team_name
        );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (matchData.length === 0) {
    return <p>No match data available.</p>;
  }

  const primaryColor = setupData[5]?.ColumnB || "#850505";

  return (
    <div className="font-bebas-neue font-[500]">
      <motion.div
        key="matchData"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} // Fade out on exit
        transition={{ duration: 2 }}
      >
        {/*#1 data start*/}
        <div className=" ">
          {matchData?.slice(0, 1).map(
            (team, index) =>
              team.team_name &&
              team.total_points ===
                Math.max(...matchData.map((t) => t.total_points)) && ( // Check if team_name exists
                <div key={index}>
                  <div className="w-[1980px] h-[1080px]  font-bebas-neue font-[500] text-white relative ">
                    <div
                      className="bg-red-800 w-[300px] h-[120px]  left-[820px] absolute top-[30px] text-center text-[50px] "
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div
                        className="relative bg-white text-black bottom-[8px]"
                        style={{ color: primaryColor }}
                      >
                        DAY - {setupData[3]?.ColumnB}
                      </div>
                      <div className="relative bottom-[18px]">
                        MATCH - {setupData[4]?.ColumnB}
                      </div>
                    </div>
                    <div className="text-[150px]   absolute text-white w-[100%] h-[100%] text-center bottom-[20px] right-[550px]">
                      MATCH RANKING
                    </div>

                    <div className="relative right-[70px]">
                      <div
                        className="bg-[#000000bc] w-[942px] h-[360px] relative left-[100px] top-[180px] border-red-800 border-[4px]"
                        style={{ borderColor: primaryColor }}
                      >
                        <div className="text-[80px] relative left-[15px] mb-[-122px]">
                          {index + 1}
                        </div>
                        <div className="flex">
                          {team.total_points ===
                            Math.max(...matchData.map((t) => t.total_points)) &&
                          team.player_photos &&
                          team.player_photos.length > 0
                            ? team.player_photos.map((photo, index) => (
                                <div
                                  key={index}
                                  className="w-[340px] h-[300px] relative top-[56px] right-[30px] z-0 mr-[-120px]"
                                >
                                  <Image
                                    src={
                                      photo[0] ||
                                      "https://res.cloudinary.com/dqckienxj/image/upload/v1735762279/defult_chach_apsjhc_dwnd7n.png"
                                    }
                                    alt={`Player ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                                    className="w-full h-full"
                                  />
                                </div>
                              ))
                            : // Show default player photos if no player photos are available
                              Array(4)
                                .fill(null)
                                .map((_, index) => (
                                  <div
                                    key={index}
                                    className="w-[340px] h-[300px] relative top-[56px] right-[30px] z-0 mr-[-120px]"
                                  >
                                    <Image
                                      src="https://res.cloudinary.com/dqckienxj/image/upload/v1735762279/defult_chach_apsjhc_dwnd7n.png"
                                      alt={`Default Player ${index + 1}`}
                                      className="w-full h-full"
                                      layout="fill"
                                      objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                                    />
                                  </div>
                                ))}
                        </div>
                      </div>
                      <div className="flex ">
                        <div
                          className="bg-red-800 w-[490px] h-[130px] relative left-[100px] top-[187px]"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <div className="w-[160px] h-[140px] relative top-[-13px] ">
                            <Image
                              src={
                                team.team_logo ||
                                "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                              }
                              alt="logo"
                              width={220}
                              height={220}
                            />
                          </div>
                          <div className="w-[2px] h-[110px] bg-white relative left-[140px] bottom-[130px]"></div>
                          <div className="relative text-[100px] text-[white]  bottom-[255px] left-[160px]">
                            {team.team_name}
                          </div>
                          {team.chicken === 1 ? (
                            <div className="w-[80px] h-[80px] relative bottom-[380px] left-[400px]">
                              <Image
                                src="https://res.cloudinary.com/dqckienxj/image/upload/v1735721889/roast-chicken_kjcdkw.png"
                                alt=""
                                className="w-full h-full"
                                layout="fill"
                                objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                              />
                            </div>
                          ) : (
                            <div></div>
                          )}
                        </div>

                        <div className="bg-[#000000bc] w-[150px] h-[130px] relative left-[100px] top-[187px]">
                          <div className="text-[100px] text-center">
                            {team.team_position}
                          </div>
                        </div>
                        <div
                          className="bg-red-800 w-[150px] h-[130px] relative left-[100px] top-[187px]"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <div className="text-[100px] text-center">
                            {team.team_kills}
                          </div>
                        </div>
                        <div className="bg-[#000000bc] w-[150px] h-[130px] relative left-[100px] top-[187px]">
                          <div className="text-[100px] text-center">
                            {team.total_points}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
          {/*#1 data ends*/}

          {/*#2-4 data starts*/}
          {matchData
            ?.filter(
              (team) =>
                team.team_name && // Check if team_name exists
                team.total_points !==
                  Math.max(...matchData.map((t) => t.total_points))
            ) // Exclude the highest total_points
            .slice(0, 4) // Show from the second highest to the fifth highest
            .map((team, index) => (
              <motion.div
                className="relative left-[33px] bottom-[395px] mb-[10px] text-white flex"
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.2,
                }} // Staggered animation
              >
                <div className="flex text-[60px] text-center ">
                  <div
                    className="w-[100px] h-[80px] bg-red-800 "
                    style={{ backgroundColor: primaryColor }}
                  >
                    {index + 2}
                  </div>
                  <div className="w-[392px] h-[80px] bg-[#000000bc] flex">
                    <div className="w-[90px] h-[90px] relative left-[5px]">
                      <Image
                        src={
                          team.team_logo ||
                          "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                        }
                        layout="fill"
                        objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                    <div className="w-[2px] h-[68px] bg-white mt-[5px]"></div>
                    <div className="ml-[8px]">{team.team_name}</div>
                    {team.chicken === 1 ? (
                      <div className="w-[65px] h-[65x] relative top-[6px] left-[90px] ">
                        <Image
                          src="https://res.cloudinary.com/dqckienxj/image/upload/v1735721889/roast-chicken_kjcdkw.png"
                          layout="fill"
                          objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                          alt="Image"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>

                  <div
                    className="w-[148px] h-[80px] bg-red-800 "
                    style={{ backgroundColor: primaryColor }}
                  >
                    {team.team_position}
                  </div>
                  <div className="w-[148px] h-[80px] bg-[#000000bc] text-ce">
                    {team.team_kills}
                  </div>
                  <div
                    className="w-[148px] h-[80px] bg-red-800"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {team.total_points}
                  </div>
                </div>
              </motion.div>
            ))}
          {/*#2-4 data ends*/}

          <div
            className="w-[936px] h-[30px] border-solid border-red-800 border-[2px] bg-white relative left-[1000px] bottom-[1261px] text-red-500 font-[orbitron] font-[900] text-[20px]"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <div className="relative left-[40px]">#</div>
            <div className="relative left-[120px] bottom-[28px]">TEAM</div>
            <div className="relative left-[525px] bottom-[58px]">PLACE</div>
            <div className="text-[20px] relative left-[680px] bottom-[88px]">
              KILLS
            </div>
            <div className="text-[20px] relative left-[820px] bottom-[118px]">
              TOTAL
            </div>
          </div>

          {pageData.map((team, index) => (
            <motion.div
              className="relative left-[1000px] bottom-[1250px] mb-[10px] text-white flex"
              key={`${currentPage}-${index}`} // Ensure a unique key per page switch
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.2,
              }} // Staggered animation
            >
              <div className="flex text-[60px] text-center">
                <div
                  className="w-[100px] h-[80px] bg-red-800 "
                  style={{ backgroundColor: primaryColor }}
                >
                  {/* Adjust index based on currentPage */}
                  {currentPage === 1 ? index + 6 : index + 15}
                </div>
                <div className="w-[392px] h-[80px] bg-[#000000bc] flex">
                  <div className="w-[90px] h-[90px] relative left-[5px]">
                    <Image
                      src={
                        team.team_logo ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
                      }
                      className="w-full h-full"
                      layout="fill"
                      objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                      alt="Image"
                    />
                  </div>
                  <div className="w-[2px] h-[68px] bg-white mt-[5px]"></div>
                  <div className="ml-[8px]">{team.team_name}</div>
                  {team.chicken === 1 ? (
                    <div className="w-[65px] h-[65px] relative top-[6px] left-[150px]">
                      <Image
                        src="https://res.cloudinary.com/dqckienxj/image/upload/v1735721889/roast-chicken_kjcdkw.png"
                        alt="Image"
                        className="w-full h-full"
                        layout="fill"
                        objectFit="cover" // You can use objectFit like 'cover' or 'contain'
                      />
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>

                <div
                  className="w-[148px] h-[80px] bg-red-800 "
                  style={{ backgroundColor: primaryColor }}
                >
                  {team.team_position}
                </div>
                <div className="w-[148px] h-[80px] bg-[#000000bc] text-ce">
                  {team.team_kills}
                </div>
                <div
                  className="w-[148px] h-[80px] bg-red-800"
                  style={{ backgroundColor: primaryColor }}
                >
                  {team.total_points}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MatchData;
