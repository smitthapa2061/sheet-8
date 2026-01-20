import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image for optimization

// Types
interface MatchPlayerData {
  player_name: string;
  player_kills: number;
  contribution: number;
  player_photo?: string;
  team_logo?: string;
  team_kills: number;
}

interface SetupDataRow {
  ColumnB: string;
}

interface MatchDataResponse {
  match_info: MatchPlayerData[];
  error?: string;
}

interface SetupDataResponse {
  values: string[][];
}

const Mvp: React.FC = () => {
  const [matchData, setMatchData] = useState<MatchPlayerData[]>([]);
  const [setupData, setSetupData] = useState<SetupDataRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const matchDataURL =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  // 👇 Updated API key and spreadsheet ID used here love 💕
const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
  const setupRange = "setup!A2:B10";

  const setupURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${setupRange}?key=${apiKey}`;

  useEffect(() => {
    // Fetch match data
    axios
      .get<MatchDataResponse>(matchDataURL)
      .then((response) => {
        const data = response.data;
        if (data.error) {
          setError(data.error);
        } else {
          const sortedData: MatchPlayerData[] = data.match_info.sort(
            (a, b) =>
              b.player_kills - a.player_kills || b.contribution - a.contribution
          );
          setMatchData(sortedData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching match data.");
        setLoading(false);
      });

    // Fetch setup sheet data
    axios
      .get<SetupDataResponse>(setupURL)
      .then((response) => {
        const setupValues = response.data.values;
        if (setupValues) {
          const formatted: SetupDataRow[] = setupValues.map(
            (row: string[]) => ({
              ColumnB: row[1] || "",
            })
          );
          setSetupData(formatted);
        }
      })
      .catch(() => {
        setError("Error fetching setup data.");
        setLoading(false);
      });
  }, [setupURL]); // Added setupURL to the dependency array

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (matchData.length === 0) return <p>No match data available.</p>;

  const primaryColor = setupData[5]?.ColumnB || "#850505";

  return (
    <div className="font-bebas-neue font-[500]">
      <motion.div
        key="matchData"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      >
        <div>
          {matchData.slice(0, 1).map((team, index) => {
            const topPlayer =
              team.player_name && team.team_kills > 0 ? team : null;
            return topPlayer &&
              topPlayer.player_kills ===
                Math.max(...matchData.map((t) => t.player_kills)) ? (
              <div key={index} className="w-[1920px] h-[1080px]">
                <div
                  className="text-white text-[200px] left-[1390px] absolute top-[20px] font-teko"
                  style={{ color: primaryColor }}
                >
                  PLAYER
                </div>
                <div className="text-white text-[200px] left-[820px] absolute top-[170px]">
                  MOST VALUEABLE
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 680 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute top-[134px] scale-110 left-[90px]">
                    <Image
                      src={
                        topPlayer?.player_photo ||
                        "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921113/nidvrnkwo0qbpatawjjq.png"
                      }
                      alt="Player"
                      width={800}
                      height={500}
                      priority
                    />
                  </div>
                </motion.div>
                <div className="text-white font-teko font-[300]">
                  <div className="bg-[#ebebeb] w-[200px] h-[200px] relative left-[1000px] top-[450px]">
                    <Image
                      src={
                        topPlayer?.team_logo ||
                        "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921117/orqtufih6h2efu2s24um.png"
                      }
                      alt="Team Logo"
                      width={200}
                      height={200}
                      priority
                    />
                  </div>

                  <div
                    className="absolute left-[1200px] h-[170px] w-[600px] text-center top-[480px]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="text-[200px] relative top-[-50px]">
                      {topPlayer?.player_name}
                    </div>

                    <div
                      className="w-[200px] h-[140px] bg-black absolute left-[-200px] top-[230px]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="text-[100px]">1</div>
                      <div className="text-[50px] bg-white text-black h-[60px] absolute w-[200px] top-[140px]">
                        RANK
                      </div>
                    </div>

                    <div
                      className="w-[200px] h-[140px] bg-black absolute left-[100px] top-[230px]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="text-[100px]">
                        {topPlayer?.player_kills}
                      </div>
                      <div className="text-[50px] bg-white text-black h-[60px] absolute w-[200px] top-[140px]">
                        KILLS
                      </div>
                    </div>

                    <div
                      className="w-[200px] h-[140px] bg-black absolute left-[400px] top-[230px]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="text-[100px]">
                        {topPlayer?.contribution}%
                      </div>
                      <div className="text-[50px] bg-white text-black h-[60px] absolute w-[200px] top-[140px]">
                        CONTRIBUTION
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Mvp;
