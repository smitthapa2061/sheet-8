"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { div } from "framer-motion/client";

interface Team {
  team_name: string;
  team_logo?: string;
  Alive: number;
  team_position: number;
  team_kills: number;
}

interface MatchResponse {
  match_info: Team[];
  error?: string;
}

interface SetupData {
  values: [string, string][];
}

interface SetupParsed {
  TOR_NAME?: string;
  TOR_LOGO?: string;
  ROUND?: string;
  DAY?: string;
  MATCHES?: string;
  PRIMARY_COLOR?: string;
  SECONDARY_COLOR?: string;
  TEXT_COLOR_1?: string;
  TEXT_COLOR_2?: string;
}

const Alerts: React.FC = () => {
  const [matchAlerts, setMatchAlerts] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [latestDeadTeam, setLatestDeadTeam] = useState<Team | null>(null);
  const [setupData, setSetupData] = useState<SetupParsed>({});
  const [primaryColor, setPrimaryColor] = useState<string>("#b31616");

  const prevMatchAlerts = useRef<Team[]>([]);
  const displayedDeadTeams = useRef<Set<string>>(new Set());
const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
  const url =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const setupUrl =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/setup!A2:B10?key=${apiKey}`;

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const response = await axios.get<SetupData>(setupUrl);
        const setupValues = response.data.values;

        const parsed: SetupParsed = {};
        setupValues.forEach(([key, value]) => {
          const cleanKey = key.trim().replace(/\s+/g, "_").toUpperCase();
          parsed[cleanKey as keyof SetupParsed] = value;
        });

        setSetupData(parsed);
        if (parsed.PRIMARY_COLOR) setPrimaryColor(parsed.PRIMARY_COLOR);
      } catch (err) {
        console.error("Error fetching setup data:", err);
      }
    };

    fetchSetupData();

    const fetchData = () => {
      axios
        .get<MatchResponse>(`${url}?t=${new Date().getTime()}`)
        .then((response) => {
          if (response.data.error) {
            setError(response.data.error);
          } else {
            const uniqueTeams: Team[] = [];
            const teamNames = new Set<string>();

            response.data.match_info.forEach((team) => {
              if (!teamNames.has(team.team_name)) {
                teamNames.add(team.team_name);
                uniqueTeams.push(team);
              }
            });

            if (
              JSON.stringify(uniqueTeams) !==
              JSON.stringify(prevMatchAlerts.current)
            ) {
              setMatchAlerts(uniqueTeams);
              prevMatchAlerts.current = uniqueTeams;

              uniqueTeams.forEach((team) => {
                if (
                  team.Alive === 0 &&
                  !displayedDeadTeams.current.has(team.team_name)
                ) {
                  setLatestDeadTeam(team);
                  displayedDeadTeams.current.add(team.team_name);

                  setTimeout(() => {
                    setLatestDeadTeam(null);
                  }, 7000);
                }

                if (team.Alive > 0) {
                  displayedDeadTeams.current.delete(team.team_name);
                }
              });
            }
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching data.");
          setLoading(false);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [url]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (matchAlerts.length === 0) return <p>No match data available.</p>;

  return (
    <>
      <div className="w-[1920px] h-[1080px] absolute   scale-150">
        {latestDeadTeam && (
          <div className="">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative top-[180px] scale-[80%]"
            >
              <div
                style={{ backgroundColor: setupData.SECONDARY_COLOR }}
                className="w-[307px] h-[70px] bg-black left-[890px] top-[380px] absolute skew-x-[-17deg] text-black font-[teko] font-[700] text-[50px] pl-[30px] "
              >
                ELIMINATED
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="Rectangle57 flex justify-evenly relative w-[550px] h-[130px] mx-auto top-[450px]  "
                style={{
                  background: primaryColor,
                  clipPath:
                    "polygon(100% 0%, 90% 100%, -100% 100%,-100% 0%, 0% 0%,100% 0%,0% 0%)",
                }}
              >
                <div
                  style={{
                    clipPath:
                      "polygon(100% 0%, 80% 100%, -100% 100%,-100% 100%, 0% 100%,0% 100%,20% 0%)",
                  }}
                  className="bg-gradient-to-tr from-white to-[#a7a7a7] w-[270px] h-[340px] relative right-[150px] flex justify-center items-center"
                >
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: 150,
                      height: 150,
                    }}
                    className="border-white mt-[-190px] "
                    src={
                      latestDeadTeam.team_logo ||
                      "https://res.cloudinary.com/dqckienxj/image/upload/v1727161524/default_ryi6uf.png"
                    }
                    alt="Team Logo"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  className="text-[4rem] font-bebas-neue h-full flex items-center top-[20px] relative left-[-100px] flex-col text-white"
                  style={{ color: setupData.TEXT_COLOR_2 || "white" }}
                >
                  TEAM {latestDeadTeam.team_name || "TEAM NAME"}
                </motion.div>
              </motion.div>
              <div
                style={{
                  backgroundColor: setupData.SECONDARY_COLOR || "#eee",
                }}
                className="w-[270px] h-[60px] bg-black left-[880px] top-[570px] absolute skew-x-[-17deg] text-black font-[teko] font-[600] text-[40px] pl-[30px] "
              >
                TOTAL KILLS - {latestDeadTeam.team_kills}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Alerts;
