import React, {useState, useEffect, useRef } from 'react';
import axios from "axios";


interface Candidate {
  about?: string;
  skills?: string[];
  short_description?: string[];
  other_summary?: Record<string, string>;
  evaluation?: {
    title?: string;
    scores?: Record<string, number>;
    evaluation_reason?: string[];
  };
  consider?: string;
}

interface ApiResponse {
  message?: string;
  parsedJson?: {
    candidate?: Candidate;
  };
}

interface JobDescription {
  clickValue?: boolean;
  file?: File;
  [key: string]: unknown;
}


interface Props {
  jobDescription: JobDescription;
  setFindWhichPage: (name: string) => void;
  FindWhichPage: string
}


const JobAIGen: React.FC<Props> = ({ jobDescription, setFindWhichPage, FindWhichPage }) => {

  const [bindData, setBindData] = useState<Candidate | null>(null);
  const hasChanged = useRef(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = sessionStorage.getItem("bindData");
      setBindData(savedData ? JSON.parse(savedData) : null);
    }
  }, []);


      useEffect(() => {
        // console.log(jobDescription,'jobDescription')
        if ((!hasChanged.current && jobDescription?.clickValue && FindWhichPage == 'jobdescription')||sessionStorage.getItem("bindData") == null) {
          sendData();
          hasChanged.current = true;
        }
      }, [jobDescription?.clickValue]);
    
      const sendData = async () => {
        try {
          setLoading(true); // Start loader
          const formData = new FormData();
          formData.append("jobDescription", JSON.stringify(jobDescription));
    
          if (jobDescription.file instanceof File) {
            formData.append("file", jobDescription.file);
          }
    
          const res = await axios.post<ApiResponse>("/api/job-description", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
    
          setBindData(res.data.parsedJson?.candidate || null);
          sessionStorage.setItem("bindData", JSON.stringify(res.data.parsedJson?.candidate));
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error:", error);
            // setErrData(error.message || "Unknown error");
          }
          setBindData(null);
          sessionStorage.removeItem("bindData");
        } finally {
          setLoading(false); // Stop loader
        }
      };
      
    return (
      <div className="w-1/2 m-5 p-5">
          <div className="mb-5">
            {/* <h1 className="mb-2 text-5xl text-gray-900 dark:text-white">{errData}</h1> */}
            <h1 className="mb-2 text-5xl text-gray-900 dark:text-white">{bindData?.about || "No information available"}</h1>
            {loading && <img src="loader.gif" />}
          </div>
          
          {/* Skill sets: */}
          {bindData?.skills && bindData.skills.length > 0 && (
          <div className="mb-8">
            <h1 className="mb-2 text-gray-900 dark:text-white">Skill sets:</h1>
            {bindData?.skills.map((skill, index) => (
                <span
                    key={index}
                    className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:text-opacity-80
                    ${[
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
                        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
                        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
                    ][index % 8]}`}
                >
                    {skill}
                </span>
                ))}

          </div>
          )}
          
          {/* Short Description: */}
          {bindData?.short_description && bindData?.short_description.length > 0 && (
          <div className="mb-5">
            <h1 className="mb-2 text-gray-900 dark:text-white">Short Description:</h1>
            <ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-400">
              {bindData.short_description.map((desc, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                  </svg>
                  {desc}
                </li>
              ))}
            </ul>
          </div>
          )}
          
          {/* Other Summary: */}
          {bindData?.other_summary && Object.entries(bindData?.other_summary).length > 0 && (
            <div className="mb-5">
              <h1 className="mb-2 text-gray-900 dark:text-white">Other Summary:</h1>
              <div className="my-2">
                {Object.entries(bindData?.other_summary)
                      .reduce<[string, string | number][][]>((acc, curr, index) => {
                          if (index % 2 === 0) {
                          acc.push([curr]);
                          } else {
                          acc[acc.length - 1].push(curr);
                          }
                          return acc;
                      }, [])
                      .map((group, i) => (
                          <div key={i} className="flex mb-2">
                          {group.map(([key, value]) => (
                              <kbd
                              key={key}
                              className="px-2 mx-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                              >
                              {key.replace("_", " ")} - <span className="mx-2">{value}</span>
                              </kbd>
                          ))}
                          </div>
                      ))}

              </div>
            </div>
          )}
          
          {bindData?.evaluation?.scores && Object.keys(bindData.evaluation.scores).length > 0 && (
          <div className="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
            <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{bindData.evaluation.title}</h5>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg grid grid-cols-3 gap-3">
              {Object.entries(bindData.evaluation.scores || {}).map(([key, value], index) => (
                <dl
                    key={index}
                    className={`${index === 0 ? "bg-orange-50" : index === 1 ? "bg-teal-50" : "bg-blue-50"} 
                                dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]`}
                >
                    <dt
                    className={`w-8 h-8 rounded-full 
                                ${index === 0 ? "bg-orange-100 text-orange-600" : 
                                    index === 1 ? "bg-teal-100 text-teal-600" : 
                                    "bg-blue-100 text-blue-600"} 
                                text-sm font-medium flex items-center justify-center mb-1`}
                    >
                    {value}
                    </dt>
                    <dd
                    className={`${index === 0 ? "text-orange-600" : index === 1 ? "text-teal-600" : "text-blue-600"} 
                                text-sm font-medium`}
                    >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    </dd>
                </dl>
                ))}

            </div>
          </div>
          )}

          {/* Evaluation Reason: */}
      {bindData?.evaluation?.evaluation_reason && bindData.evaluation.evaluation_reason.length > 0 && (

          <div className="my-5">
            <h1 className="mb-2 text-gray-900 dark:text-white">Evaluation Reason:</h1>
            <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
              {bindData.evaluation.evaluation_reason.map((reason, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <svg className="shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5.917 5.724 10.5 15 1.5" />
                  </svg>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
      )}

          {/* consider */}
      {bindData?.consider && (

          <div className="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                <span className="font-medium">Info alert!</span> Can we consider this candidate for this JD : {bindData.consider}
                </div>
            </div>
      )}

       {bindData?.skills && bindData.skills.length > 0 &&
            <button className="flex justify-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={()=>{setFindWhichPage('preference')}}>Preference Based Q&A ✨</button>
        }
           
      </div>
    );
}

export default JobAIGen;



