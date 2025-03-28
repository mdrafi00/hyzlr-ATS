import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface Feedback {
  category: string;
  comment: string;
}

interface ScoreData {
  Technical: number;
  Communication: number;
  Responsiveness: number;
  ProblemSolving: number;
  SoftSkills: number;
  Responded: number;
  OverAll: number;
  feedback: Feedback[];
  suggestedImprovements: string[];
}

interface ScoreCardProps {
  FindWhichPage: string;
}

function ScoreCard({ FindWhichPage }: ScoreCardProps) {
  const hasChanged = useRef<boolean>(false);
  const [data, setData] = useState<ScoreData[]>([]);
    const [savedData] = useState<ScoreData[] | null>(() => {
      const savedData = sessionStorage.getItem("chatData");
      return savedData ? JSON.parse(savedData) : [];
    });
    const [loading, setLoading] = useState(false);


  const categoryColors: Record<string, string> = {
    Technical: "bg-blue-100 text-blue-600",
    Communication: "bg-purple-100 text-purple-600",
    Responsiveness: "bg-green-100 text-green-600",
    ProblemSolving: "bg-yellow-100 text-yellow-600",
    SoftSkills: "bg-red-100 text-red-600",
    Responded: "bg-gray-100 text-gray-600",
    OverAll: "bg-orange-100 text-gray-600",
  };

  useEffect(() => {
    if (!hasChanged.current) {
    // if (!hasChanged.current && FindWhichPage === "result") {
      sendData();
      hasChanged.current = true;
    }
  }, [FindWhichPage]);

  const sendData = async () => {
    try {
      setLoading(true); // Start loader
      const res = await axios.post<ScoreData[]>("/api/scoring", {"questions":savedData }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      setData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="flex justify-center">
      {data.map((score, index) => (
        <div key={index} className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
          <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Candidate Score</h5>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg grid grid-cols-3 gap-3">
            {Object.entries(score)
              .filter(([key]) => !["feedback", "suggestedImprovements"].includes(key))
              .map(([key, value]) => (
                <div key={key} className={`rounded-lg flex flex-col items-center justify-center h-[78px] ${categoryColors[key] || ''}`}>
                  <span className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center mb-1 ${categoryColors[key] || ''}`}>
                    {value}
                  </span>
                  <span className="text-sm font-medium">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
              ))}
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback</h2>
            <ul className="space-y-2 text-gray-500 dark:text-gray-400">
              {score.feedback.map((item, idx) => (
                <li key={`${item.category}-${idx}`} className="text-sm flex items-center">
                  <svg className="w-3.5 h-3.5 me-2 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                  </svg>
                  <span>
                    <strong className="text-gray-900 dark:text-white">{item.category.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                    {item.comment}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Suggested Improvements</h2>
            <ul className="space-y-1 text-gray-500 dark:text-gray-400 list-disc pl-5">
              {score.suggestedImprovements.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
     {loading && <img src="loader.gif" />}

    </div>
  );
}

export default ScoreCard;
