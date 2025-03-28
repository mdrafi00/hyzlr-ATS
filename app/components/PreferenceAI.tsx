import React, { useState, useEffect, useRef  } from "react";
import axios from "axios";

const colorMap: Record<string, string> = {
  easy: "text-green-500 dark:text-green-400",
  medium: "text-orange-500 dark:text-orange-400",
  hard: "text-red-500 dark:text-red-400",
};

interface Props {
  jobDescription: JobDescription;
  setFindWhichPage: (name: string) => void;
  FindWhichPage: string
}

interface JobDescription {
  clickValue?: boolean;
  file?: File;
  [key: string]: unknown;
}

interface ApiResponse {
  message?: string;
  parsedJson?: QuestionSet[];
}

interface QuestionSet {
  set: number;
  categories: Category[];
}

interface Category {
  category: string;
  questions: Record<string, string[]>;
}

const PreferenceAI: React.FC<Props> = ({ jobDescription, setFindWhichPage, FindWhichPage }) => {
  const [questionData, setQuestionData] = useState<QuestionSet[] | null>(() => {
    const savedData = sessionStorage.getItem("questionData");
    return savedData ? JSON.parse(savedData) : null;
  });
  const hasChanged = useRef(false);
  const [activeSet, setActiveSet] = useState(0);
    const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if ((!hasChanged.current && jobDescription?.clickValue && FindWhichPage == 'preference')||sessionStorage.getItem("bindData") == null) {
      sendData();
      hasChanged.current = true;
    }
  }, [jobDescription]);

  const sendData = async () => {
    try {
      setLoading(true); // Start loader
      const formData = new FormData();
      formData.append("jobDescription", JSON.stringify(jobDescription));

      if (jobDescription.file instanceof File) {
        formData.append("file", jobDescription.file);
      }

      const res = await axios.post<ApiResponse>("/api/listdown-questions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setQuestionData(res.data.parsedJson || null);
      sessionStorage.setItem("questionData", JSON.stringify(res.data.parsedJson));
    } catch (error) {
      console.error("Error:", error);
      setQuestionData(null);
      sessionStorage.removeItem("questionData");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div>
      {/* Tabs Navigation */}
      {questionData && (
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          {questionData.map((data, index) => (
            <li key={index} className="me-2">
              <button
                onClick={() => setActiveSet(index)}
                className={`inline-block p-4 rounded-t-lg ${
                  activeSet === index
                    ? "text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                    : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                }`}
              >
                Set {data.set}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Questions Display */}
      {questionData && questionData[activeSet] && (
        questionData[activeSet].categories.map((categoryData, index) => (
          <div key={index} className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {categoryData.category} Questions:
            </h2>
            <ul className="max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400">
              {Object.entries(categoryData.questions).map(([difficulty, questions]) => (
                <div key={difficulty} className="pt-4">
                  {questions.map((question, qIndex) => (
                    <li key={qIndex} className="flex items-center">
                      <svg
                        className={`w-3.5 h-3.5 me-2 ${colorMap[difficulty]} shrink-0`} 
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                      </svg>
                      {question}
                    </li>
                  ))}
                </div>
              ))}
            </ul>
          </div>
        ))
      )}
      {questionData ? <div className="flex justify-between">
        <button className="flex justify-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        onClick={()=>{setFindWhichPage('jobdescription')}}
        >
            Profile Evaluation ✨
          </button>
          <button className="flex justify-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={()=>{setFindWhichPage('interview')}}
          >
            Get Start Interview ✨
          </button>
      </div>: <h1 className="text-5xl">No Information Found!</h1>}
        {loading && <img src="loader.gif" />}

    </div>
  );
};

export default PreferenceAI;
