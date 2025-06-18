import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";

interface RowData {
  ColumnA: string | null;
  ColumnB: string;
  ColumnC: number;
  ColumnD: number;
  ColumnE: number;
  ColumnF: number;
  ColumnG: number;
}

interface SetupDataRow {
  ColumnB: string;
}

interface GoogleSheetsResponse {
  values: string[][];
}

const apiKey: string = "AIzaSyCW9Livk0yImrNLglojFFq8pxdlJrIbzXk";
const spreadsheetId: string = "1mrEcSItZjsMf-T8f6UoOcEXro0Fm06hYLc3oMhdUDck";
const range = "overall1!A2:P100";
const range2 = "setup!A2:B10";

const Overall: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [data2, setData2] = useState<SetupDataRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumn, setVisibleColumn] = useState(0);
  const batchSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        const response = await axios.get<GoogleSheetsResponse>(url);
        const values = response.data.values || [];

        const seen = new Set<string>();
        const formattedData: RowData[] = values
          .map((row) => ({
            ColumnA: row[15] || null,
            ColumnB:
              row[1] ||
              "https://res.cloudinary.com/dqckienxj/image/upload/v1730785916/default_ryi6uf_edmapm.png",
            ColumnC: row[3] ? parseInt(row[3], 10) : 0,
            ColumnD: row[4] ? parseInt(row[4], 10) : 0,
            ColumnE: row[9] ? parseInt(row[9], 10) : 0,
            ColumnF: row[2] ? parseInt(row[2], 10) : 0,
            ColumnG: row[10] ? parseInt(row[10], 10) : 0,
          }))
          .filter((row) => {
            if (!row.ColumnA) return false;
            const normalized = row.ColumnA.trim().toLowerCase();
            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
          });

        setData(formattedData);

        const url2 = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?key=${apiKey}`;
        const response2 = await axios.get<GoogleSheetsResponse>(url2);
        const values2 = response2.data.values || [];

        const formattedData2: SetupDataRow[] = values2.map((row) => ({
          ColumnB: row[1] || "",
        }));

        setData2(formattedData2);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    const totalPages = Math.ceil(data.length / batchSize); // removed manual 4 limit
    const interval = setInterval(() => {
      setVisibleColumn((prev) => (prev + 1) % totalPages);
    }, 40000); // every 40 seconds
    return () => clearInterval(interval);
  }, [data]);

  const sortedData = [...data].sort((a, b) => {
    if (b.ColumnF !== a.ColumnF) return b.ColumnF - a.ColumnF;
    if (a.ColumnD !== b.ColumnD) return b.ColumnD - a.ColumnD;
    if (b.ColumnC !== a.ColumnC) return b.ColumnC - a.ColumnC;
    return b.ColumnE - a.ColumnE;
  });

  const startIndex = visibleColumn * batchSize;
  const endIndex = Math.min(startIndex + batchSize, sortedData.length);
  const currentVisibleData = sortedData.slice(startIndex, endIndex);

  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-[1920px] h-[1080px] bg-yellow">
      <div className="text-white text-[140px] font-[600] mb-[-120px] font-[teko] relative top-[-15px] left-[156px]">
        OVERALL RANKING
      </div>
      {data2.length > 0 && (
        <div
          style={{ backgroundColor: `${data2[5].ColumnB}` }}
          className="w-[900px] h-[60px] mb-[-40px] relative left-[165px] text-[40px] text-white font-[montserrat] font-[700] text-left tracking-wider top-[50px] pl-[20px]"
        >
          {data2[2].ColumnB} | DAY - {data2[3].ColumnB} | MATCH -{" "}
          {data2[4].ColumnB}
        </div>
      )}

      <motion.div
        key={visibleColumn} // This retriggers animation on page change
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {data2.length > 0 && (
          <div>
            <div
              style={{
                clipPath: "polygon(0% 100%,100% 100%,100% 0%, 2% 10%)",
                borderColor: `${data2[5].ColumnB}`,
              }}
              className="w-[1321px] h-[35px] bg-white mb-[-80px] relative left-[75px] border-[1px] top-[110px]"
            >
              <div className="flex">
                <div
                  style={{ color: `${data2[5].ColumnB}` }}
                  className="flex font-[montserrat] font-[800] text-[24px] tracking-wider"
                >
                  <div className="ml-[40px]">#</div>
                  <div className="ml-[80px]">TEAM</div>
                  <div className="ml-[570px]">WWCD</div>
                  <div className="ml-[40px]">PLACE</div>
                  <div className="ml-[63px]">KILLS</div>
                  <div className="ml-[60px]">TOTAL</div>
                </div>
              </div>
            </div>

            <motion.div
              key={visibleColumn} // Ensures animation retriggers on visibleColumn change
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4 relative top-[180px] font-bebas-neue font-[500] left-[0px]"
            >
              <ul>
                {currentVisibleData.map((row, index) => {
                  const displayIndex = startIndex + index + 1;
                  return (
                    <motion.div
                      className="p-4 mb-2 w-[1800px] h-[65px] relative left-[60px] flex"
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: index * 0.2,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: `${data2[5].ColumnB}`,
                          clipPath:
                            "polygon(100% 100%,100% 100%,100% -90%, -50% 100%)",
                        }}
                        className="w-[100px] h-[63px] text-[58px] flex justify-center items-center text-white"
                      >
                        <div className="relative top-[4px]">{displayIndex}</div>
                      </div>
                      <div className="bg-[#000000cf] w-[660px] h-[63px] flex">
                        <div className="w-[62px] h-[62px]">
                          <Image
                            src={row.ColumnB || ""}
                            alt="Team Logo"
                            width={62}
                            height={62}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-white text-[58px] mt-[-7px] ml-[10px]">
                          {row.ColumnA}
                        </div>
                      </div>
                      <div
                        style={{ backgroundColor: `${data2[5].ColumnB}` }}
                        className="text-white w-[140px] h-[63px] flex justify-center items-center text-[56px]"
                      >
                        {row.ColumnE}
                      </div>
                      <div
                        style={{ backgroundColor: `${data2[5].ColumnB}` }}
                        className="text-white w-[140px] h-[63px] flex justify-center items-center text-[56px]"
                      >
                        {row.ColumnD}
                      </div>
                      <div
                        style={{ backgroundColor: `${data2[5].ColumnB}` }}
                        className="text-white w-[140px] h-[63px] flex justify-center items-center text-[56px]"
                      >
                        {row.ColumnC}
                      </div>
                      <div
                        style={{
                          backgroundColor: `${data2[6].ColumnB}`,
                          color: `${data2[7].ColumnB}`,
                        }}
                        className="w-[140px] h-[63px] flex justify-center items-center text-[56px]"
                      >
                        {row.ColumnF}
                      </div>
                    </motion.div>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        )}
      </motion.div>
      <Image
        className="flex fixed top-[270px] left-[1290px]"
        width={800}
        height={500}
        src="https://res.cloudinary.com/dqckienxj/image/upload/v1745194575/Layer_1_j7bfyq.png"
        alt="img"
      />
    </div>
  );
};

export default Overall;
