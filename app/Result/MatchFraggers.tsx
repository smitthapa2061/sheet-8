import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image"; // Importing Next.js Image component

// Define types for match fragger and setup data
interface MatchFraggerData {
  player_name: string;
  player_photo: string;
  player_kills: number;
  contribution: number;
  team_name: string;
  team_logo: string;
}

interface SetupData {
  ColumnB: string;
}

interface MatchFraggerApiResponse {
  match_info: MatchFraggerData[];
  error?: string; // Optional error field
}

const MatchFragger: React.FC = () => {
  const [matchFragger, setMatchFragger] = useState<MatchFraggerData[]>([]); // Store match fragger data
  const [data2, setData2] = useState<SetupData[]>([]); // Store setup data
  const [error, setError] = useState<string | null>(null); // Error state
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // URLs for data fetching
  const url =
    "https://script.google.com/macros/s/AKfycbxsc1qrYICI5hzSEwyUqrEz2KRjgEeBRKr-PAUoyahzHPa8izU2v06wFwI6VnD37jyPrQ/exec";

  const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
  const range2 = "setup!A2:B10"; // Second dataset for match info

  useEffect(() => {
    // Fetch match fragger data
    axios
      .get<MatchFraggerApiResponse>(url)
      .then((response) => {
        const data = response.data;
        if (data.error) {
          setError(data.error);
        } else {
          const sortedData = data.match_info.sort((a, b) => {
            if (b.player_kills === a.player_kills) {
              return b.contribution - a.contribution; // Sort by highest contribution if kills are the same
            }
            return b.player_kills - a.player_kills; // Sort by highest kills first
          });

          setMatchFragger(sortedData.slice(0, 5));
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data.");
        setLoading(false);
      });

    // Fetch additional match info
    const fetchData2 = async () => {
      try {
        const url2 = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?key=${apiKey}`;
        const response = await fetch(url2);
        if (!response.ok) {
          throw new Error("Failed to fetch data from Google Sheets API");
        }
        const result = await response.json();
        setData2(
          result.values.map((row: string[]) => ({ ColumnB: row[1] || "error" })) // Handling empty strings
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };
    fetchData2();
  }, [url]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (matchFragger.length === 0) return <p>No match data available.</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Fade out on exit
      transition={{ duration: 2 }}
    >
      <div className="w-[1920px] h-[1080px] flex font-bebas-neue font-[500] ">
        <div className="m-[-350px] h-[60px] w-[700px] text-[100px] relative top-[350px] scale-150 left-[650px] text-white">
          MATCH FRAGGERS
        </div>

        {/* Copied text from Overall Component */}
        {data2.length > 0 && (
          <div
            style={{
              backgroundColor: `${data2[5]?.ColumnB}`,
            }}
            className="absolute top-[170px] left-[130px] text-white  pl-3 pr-3 text-left "
          >
            <div className="text-[40px] font-[orbitron] font-[800] tracking-wider">
              {data2[2]?.ColumnB} | DAY - {data2[3]?.ColumnB} | MATCH -{" "}
              {data2[4]?.ColumnB}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center space-x-4">
          {matchFragger.map((team, index) => (
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
                className="bg-[#000000bb] border-solid border-red-800 w-[340px] h-[416px] mr-[20px] border-[2px]"
                style={{
                  borderColor: `${data2[5]?.ColumnB}`,
                }}
              >
                <div className="text-white mb-[-90px] text-[60px] ml-[10px] relative bottom-[10px]">
                  {index + 1}
                </div>

                {/* Team Photo */}
                <div className="text-white w-[450px] h-[400px] relative right-[50px] top-[0px]">
                  <Image
                    src={
                      team.player_photo ||
                      "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921113/nidvrnkwo0qbpatawjjq.png"
                    }
                    alt="photo"
                    className="w-[100%] h-[400px] absolute"
                    width={450}
                    height={400}
                  />
                </div>

                <div className="w-[100%] bg-white h-[80px] relative top-[10px]">
                  <div
                    className="text-[80px] relative bottom-[15px] text-center text-red-800"
                    style={{
                      color: `${data2[5]?.ColumnB}`,
                    }}
                  >
                    {team.player_name}
                  </div>
                </div>

                <div
                  className="bg-red-800 w-[100%] h-[229px] text-white text-[60px]"
                  style={{
                    backgroundColor: `${data2[5]?.ColumnB}`,
                  }}
                >
                  <div className="ml-[8px] relative top-[10px] flex">
                    <div> {team.team_name}</div>
                    <div className="bg-black w-[90px] h-[60px] absolute left-[237px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                      <div className="w-[65px] h-[65px] relative left-[10px]">
                        <Image
                          src={
                            team.team_logo ||
                            "https://res.cloudinary.com/dczgqqgdp/image/upload/v1768921117/orqtufih6h2efu2s24um.png"
                          }
                          alt="logo"
                          width={65}
                          height={65}
                          className="bg-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-[65%] h-[1px] bg-white relative left-[10px] top-[-9px]"></div>

                  <div className="ml-[8px] relative top-[-10px] flex">
                    <div> KILLS</div>
                    <div className="bg-black w-[90px] h-[60px] absolute left-[237px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                      <div className="text-center top-[-12px] relative">
                        {team.player_kills}
                      </div>
                    </div>
                  </div>

                  <div className="w-[65%] h-[1px] bg-white relative left-[10px] top-[-28px]"></div>

                  <div className="ml-[8px] relative top-[-30px] flex">
                    <div className="text-[50px] relative top-[2px]">
                      CONTRIBUTION
                    </div>
                    <div className="bg-black w-[90px] h-[60px] relative left-[19.9px] top-[13px] border-solid border-white border-l-[1px] border-t-[1px] border-b-[1px]">
                      <div className="text-center top-[2px] relative text-[36px] left-[0px]">
                        {team.contribution}%
                      </div>
                    </div>
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

export default MatchFragger;
