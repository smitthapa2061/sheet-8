"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

import LiveStats from "../Stats/LiveStats";
import OverAllStats from "../Stats/OverallStats";

interface DataItem {
  ColumnA: string;
  ColumnB: string;
}

const Controller: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

const apiKey: string = "AIzaSyBSYrS0oU5fAxVVr4e3ohjMflWkxqh_Uk4";
  const spreadsheetId: string = "1f1eVMjmhmmgBPxnLI8FGkvhusLzl55jPb4_B8vjjgpo"; // Your Google Sheets ID

  const range: string = "display!A21:B37"; // Range you want to fetch

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        console.log("Fetching data...");
        const response = await axios.get<{ values: string[][] }>(
          `${url}&t=${new Date().getTime()}` // Add timestamp to bypass cache
        );

        const values = response.data.values || [];
        const formattedData: DataItem[] = values.map((row) => ({
          ColumnA: row[0] || "",
          ColumnB: row[1]?.toUpperCase() || "",
        }));

        console.log("Fetched Data:", formattedData);
        setData(formattedData);
        setError(null);
      } catch (err) {
        // Assert the error as an instance of Error
        const errorMessage = (err as Error).message || "Unknown error";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);

    return () => {
      clearInterval(interval);
      console.log("Fetching stopped: Component unmounted.");
    };
  }, [apiKey, spreadsheetId, range]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // Find the first row where ColumnB is "TRUE"
  const firstActiveRow = data.find((item) => item.ColumnB === "TRUE");

  if (!firstActiveRow) return null; // If no active rows found, return null

  return (
    <div>
      {firstActiveRow.ColumnA === "Live Stats" && <LiveStats />}
      {firstActiveRow.ColumnA === "Overall Stats" && <OverAllStats />}
    </div>
  );
};

export default Controller;
