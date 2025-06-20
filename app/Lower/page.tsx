"use client";

import React, { useEffect, useState } from "react";

interface LowerData {
  TOR_NAME: string;          // column B at row 0
  TOR_NAME_LABEL: string;    // column A at row 0

  TOR_LOGO: string;          // column B at row 1
  TOR_LOGO_LABEL: string;    // column A at row 1

  ROUND: string;             // column B at row 2
  ROUND_LABEL: string;       // column A at row 2

  DAY: string;               // column B at row 3
  DAY_LABEL: string;         // column A at row 3

  MATCHES: string;           // column B at row 4
  MATCHES_LABEL: string;     // column A at row 4

  PRIMARY_COLOR: string;     // column B at row 5
  PRIMARY_COLOR_LABEL: string; // column A at row 5

  SECONDARY_COLOR: string;     // column B at row 6
  SECONDARY_COLOR_LABEL: string; // column A at row 6

  TEXT_COLOR_1: string;     // column B at row 7
  TEXT_COLOR_1_LABEL: string; // column A at row 7

  TEXT_COLOR_2: string;     // column B at row 8
  TEXT_COLOR_2_LABEL: string; // column A at row 8
}


const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const range = "setup!A2:B16";

const Lower = () => {
  const [data, setData] = useState<LowerData | null>(null);
  const [error, setError] = useState(false);
 const [showMatch, setShowMatch] = useState(true);
  useEffect(() => {
    const fetchLowerData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch data from Google Sheets API");
        }

        const result = await response.json();
        const values = result.values;

       const fetchedData: LowerData = {
  TOR_NAME_LABEL: values[0] ? values[0][0] : "",
  TOR_NAME: values[0] ? values[0][1] : "",

  TOR_LOGO_LABEL: values[1] ? values[1][0] : "",
  TOR_LOGO: values[1] ? values[1][1] : "",

  ROUND_LABEL: values[2] ? values[2][0] : "",
  ROUND: values[2] ? values[2][1] : "",

  DAY_LABEL: values[3] ? values[3][0] : "",
  DAY: values[3] ? values[3][1] : "",

  MATCHES_LABEL: values[4] ? values[4][0] : "",
  MATCHES: values[4] ? values[4][1] : "",

  PRIMARY_COLOR_LABEL: values[5] ? values[5][0] : "",
  PRIMARY_COLOR: values[5] ? values[5][1] : "",

  SECONDARY_COLOR_LABEL: values[6] ? values[6][0] : "",
  SECONDARY_COLOR: values[6] ? values[6][1] : "",

  TEXT_COLOR_1_LABEL: values[7] ? values[7][0] : "",
  TEXT_COLOR_1: values[7] ? values[7][1] : "",

  TEXT_COLOR_2_LABEL: values[8] ? values[8][0] : "",
  TEXT_COLOR_2: values[8] ? values[8][1] : "",
};


        setData(fetchedData);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchLowerData();
  }, []);

   useEffect(() => {
    const interval = setInterval(() => {
      setShowMatch(prev => !prev);
    }, 60000); // switch every 3 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  if (error) {
    return <div>Error: Failed to load data</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-end w-[1920px] h-[1080px] ">
      <div className="mb-[0px] ">
        <div className="w-[520px] h-[200px]">
          <div className="w-[520px] h-[200px]  absolute "
            style={{ background: `linear-gradient(to left, ${data.PRIMARY_COLOR}, ${data.SECONDARY_COLOR})` }}
          >
        <div
  className={`text-center pt-[23px] font-russo tracking-wider relative left-[100px]
    ${showMatch 
      ? "text-[60px] font-[700] text-white transform scale-y-[2.5] scale-x-[1.0]" 
      : "text-[30px] font-[500] text-white transform scale-y-[1.5] scale-x-[1.2] w-[300px] relative left-[210px]" 
    }`}
>
  {showMatch ? `MATCH ${data.MATCHES}` : data.TOR_NAME}
</div>

<div className="w-[100%] bg-black h-[50px] absolute top-[150px] bg-gradient-to-tl from-[#ffcd17] to-[#ff9900]"> 
  
  <div className="text-[35px] text-black relative left-[220px] font-oswald">
   {data.DAY_LABEL} {data.DAY} - {data.ROUND}</div>
    </div>

          </div>
          <div className="bg-gradient-to-r from-[#ffffff] to-[#e3e3e3] w-[200px] h-[205px]  relative">

            <img src={data.TOR_LOGO} alt="" className="w-[100%] h-[100%]" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Lower;
