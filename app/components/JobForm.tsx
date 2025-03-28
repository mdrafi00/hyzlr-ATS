"use client";
import { useState, useEffect } from "react";

import JobAIGen from "./JobAIGen";
import PreferenceAI from "./PreferenceAI";
import ChatInterface from "./ChatInterface";
import ScoreCard from "./ScoreCard";

interface JobDescription {
  title: string;
  message: string;
  clickValue: boolean;
  file: File | null;
}


const predefinedJobs = [
  { name: "Software Engineer", message: "Develop and maintain software solutions." },
  { name: "Data Scientist", message: "Analyze data and build predictive models." },
  { name: "Marketing Manager", message: "Lead marketing campaigns and brand strategies." },
  { name: "Mechanical Engineer", message: "Design and improve mechanical systems." },
];

const JobForm: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: "",
    message: "",
    file: null,
    clickValue: false,
  });


  const [manualTitle, setManualTitle] = useState(false);
  const [FindWhichPage, setFindWhichPage] = useState('jobdescription');
  const [error, setError] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(()=>{
    sessionStorage.removeItem("bindData");
    sessionStorage.removeItem("questionData");
  },[jobDescription])


  useEffect(() => {
    const clickValue = false;
    if (jobDescription.title) {
      const selectedJob = predefinedJobs.find((job) => job.name === jobDescription.title);
      if (selectedJob) {
        setJobDescription((prev) => ({ ...prev, message: selectedJob.message, file: prev.file, clickValue }));
        setManualTitle(false);
      } else if (jobDescription.title === "manual") {
        setManualTitle(true);
        setJobDescription((prev) => ({ ...prev, title: "", message: "", file: prev.file,clickValue }));
      }
    }
    setIsButtonDisabled(false);
  }, [jobDescription.title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const clickValue = false;
    setIsButtonDisabled(false);
    setJobDescription((prev) => ({ ...prev, file,clickValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    const clickValue = true;
    e.preventDefault();
    if (!jobDescription.title || !jobDescription.message || !jobDescription.file) {
      setError("All fields are required, including file upload.");
      return;
    }
    if (jobDescription.message.length < 50) {
      setError("Job description must be at least 50 characters long.");
      return;
    }
    setError("");
    setJobDescription((prev) => ({ ...prev, clickValue }));
    setIsButtonDisabled(true);
  };

  return (
    <div className="flex justify-stretch">
      <div className="w-1/2 m-5 p-5">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="JDTitle" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              JD Title:
            </label>
            {!manualTitle && (
              <select
                id="jobSelect"
                name="title"
                value={jobDescription.title}
                onChange={(e) => {setJobDescription((prev) => ({ ...prev, title: e.target.value, file: prev.file, clickValue: false }));setIsButtonDisabled(false);}}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Choose a job title</option>
                {predefinedJobs.map((job) => (
                  <option key={job.name} value={job.name}>
                    {job.name}
                  </option>
                ))}
                <option value="manual">Add Manually</option>
              </select>
            )}
          </div>
          {manualTitle && (
            <div className="mb-5">
              <input
                id="JDTitle"
                name="title"
                value={jobDescription.title}
                onChange={(e) => {setJobDescription((prev) => ({ ...prev, title: e.target.value, file: prev.file, clickValue: false }));setIsButtonDisabled(false);}}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter job title manually"
                required
              />
            </div>
          )}
          <div className="mb-5">
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Detailed JD:
            </label>
            <textarea
              id="message"
              name="message"
              value={jobDescription.message}
              onChange={(e) => {setJobDescription((prev) => ({ ...prev, message: e.target.value, file: prev.file, clickValue: false }));setIsButtonDisabled(false);}}
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Write a detailed job description here..."
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">
              Upload file (PDF, DOCX, TXT required)
            </label>
            <input
              name="file"
              type="file"
              accept=".pdf, .docx, .txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              id="file_input"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`mt-5 text-white ${isButtonDisabled ? 'bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700' : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'} focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center `}
            >
            AI Generate ✨
          </button>
        </form>
      </div>
      {
        FindWhichPage === 'jobdescription' ?
        // <JobAIGen jobDescription={jobDescription} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} /> : 
        <JobAIGen jobDescription={{ ...jobDescription, file: jobDescription.file || undefined }} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} />:

        FindWhichPage === 'preference' ?
        // <PreferenceAI jobDescription={jobDescription} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} />:
        <PreferenceAI jobDescription={{ ...jobDescription, file: jobDescription.file || undefined }} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} />:

        FindWhichPage === 'interview' ?
        // <ChatInterface jobDescription={jobDescription} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} />:
        <ChatInterface jobDescription={{ ...jobDescription, file: jobDescription.file || undefined }} setFindWhichPage={setFindWhichPage} FindWhichPage={FindWhichPage} />:

        <ScoreCard FindWhichPage={FindWhichPage} />
      }
    </div>
  );
};

export default JobForm;
