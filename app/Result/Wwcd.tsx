import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Image from "next/image";

// Types 💫
interface Player {
  team_name: string;
  player_name: string;
  player_photo?: string;
  player_kills: number;
  contribution: number;
  total_points: number;
  chicken: number;
  team_logo?: string;
}

interface SetupMap {
  [key: string]: string;
}

interface MatchResponse {
  match_info: Player[];
  error?: string;
}

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const urlMatchData =
  "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";
const urlSetupData = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B10?key=${apiKey}`;

const WwcdTeamStats: React.FC = () => {
  const [matchData, setMatchData] = useState<Player[]>([]);
  const [setup, setSetup] = useState<SetupMap>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>("#850505");

  useEffect(() => {
    // Fetch match data
    axios
      .get<MatchResponse>(urlMatchData)
      .then((response) => {
        const data = response.data;
        if (data.error) {
          setError(data.error);
        } else {
          setMatchData(data.match_info);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching match data.");
        setLoading(false);
      });

    // Fetch setup data
    axios
      .get<{ values: [string, string][] }>(urlSetupData)
      .then((response) => {
        const values = response.data.values;
        const mapped: SetupMap = {};
        values.forEach(([key, val]) => {
          if (key) mapped[key.trim()] = val?.trim() || "";
        });
        setSetup(mapped);
        setPrimaryColor(mapped["PRIMARY COLOR"] || "#850505");
      })
      .catch(() => {
        setError("Error fetching setup data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (matchData.length === 0) return <p>No match data available.</p>;

  // Determine winning team
  const chickenWinner = matchData.find((team) => team.chicken === 1);
  const winningTeam = chickenWinner
    ? chickenWinner
    : matchData.reduce((prev, current) =>
        prev.total_points > current.total_points ? prev : current
      );
  const winningPlayers = matchData
    .filter((player) => player.team_name === winningTeam.team_name)
    .slice(0, 4);

  return (
    <div className="font-bebas-neue font-[500]  w-[1920px] h-[1080px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 8 }}
        transition={{ duration: 1 }}
      >
        <div className="w-[1980px] h-[1080px] text-white relative">
          <div className="text-[140px] absolute top-[0px] ml-[160px] font-teko font-bold">
            WWCD TEAM STATS
          </div>

          <div
            style={{
              backgroundColor: setup["SECONDARY COLOR"],
              color: setup["TEXT COLOR 1"],
            }}
            className="text-[100px] left-[260px] absolute top-[890px] font-teko  bg-red-800  h-[130px] scale-75 pl-[30px] pr-[30px]"
          >
            {setup["TOR NAME"]} - DAY {setup["DAY"]} - MATCH -{" "}
            {setup["MATCHES"]}
          </div>
          <div
            className="w-[200px] h-[60px] p-2 absolute top-[790px] ml-[670px] left-[970px] scale-150 text-center flex justify-center "
            style={{ backgroundColor: primaryColor }}
          >
            <div className="font-teko font-[300] text-[45px] relative top-[-7px]">
              {setup["ROUND"]}
              <div className="font-montserrat font-[800] text-[28px]"></div>
            </div>
          </div>
          <div className="w-[350px] h-[400px] ml-[1570px] absolute top-[210px]">
            <Image
              src={
                winningTeam.team_logo ||
                "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png"
              }
              alt={winningTeam.team_name}
              width={250}
              height={250}
              className="w-full h-full object-contain"
            />
          </div>
          <div className=" absolute top-[520px] text-[100px] ml-[1600px]">
            {winningTeam.team_name}
          </div>

          {/* Players */}
          <motion.div
            initial={{ opacity: 1, y: -100 }}
            animate={{ opacity: 7, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="absolute left-[70px] top-[210px] flex gap-[60]">
              {winningPlayers.map((player, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: primaryColor,
                    clipPath:
                      "polygon(100% 90%, 80% 100%, 10% 100%,-0% 0%, 0% 0%,0% 0%,100% 5%)",
                  }}
                  className="w-[323px] h-[650px] text-white text-[30px] font-bold shadow-lg"
                >
                  <div className="w-[500px] h-[500px] relative top-[0px] left-[-70px]">
                    <Image
                      src={
                        player.player_photo ||
                        "https://res.cloudinary.com/dqckienxj/image/upload/v1737809848/Layer_6_cnd9gl_ugaxek.png"
                      }
                      alt={player.player_name}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-[324px] h-[500px] absolute bg-gradient-to-t from-black via-transparent to-[#ffffff00] top-[00px]"></div>
                  <div
                    className="relative top-[-100px] w-[323px] h-[90px] text-center font-teko font-[300]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="text-[80px] top-[px] relative">
                      {player.player_name}
                    </div>
                  </div>
                  {/* Kills */}
                  <div className="relative left-[35px] top-[-130px] flex flex-row gap-11  ">
                    {/* Kills */}
                    <div className="text-white text-center absolute ml-[30px]">
                      <div className="flex flex-col items-center">
                        <div className="text-[90px] relative top-[30px]">
                          {player.player_kills}
                        </div>
                        <span className="font-teko font-[300] relative left-0 top-[-5px]">
                          Kills
                        </span>
                      </div>
                    </div>

                    {/* Contribution */}
                    <div className="text-white text-center mx-auto relative top-[30px]">
                      <div className="flex flex-col text-center mt-[30px]">
                        <div className="text-[50px]">
                          {player.contribution}%
                        </div>
                        <span className="font-teko font-[300] absolute top-[80px] left-[-10px]">
                          CONTRIBUTION
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-[323px] h-[770px] bg-[#000000dc] text-white text-[30px] font-bold shadow-lg mt-[-750px]"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WwcdTeamStats;
