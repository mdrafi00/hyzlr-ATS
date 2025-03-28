"use client";

import { useState, useEffect, useRef  } from "react";
import axios from "axios";

interface Question {
  question: string;
  userResponse: string | null;
  actualTime: string;
  ResponseTime: string;
  CandidateAnsweredTime?: string | null;
}

interface ChatData {
  sessionId: string;
  questions: Question[];
}

interface ApiResponse {
  sessionId: string;
  questions: Question[];
}

interface ApiResponseFirst {
  sessionId: string;
  question: string;
}

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

const ChatInterface: React.FC<Props> = ({ jobDescription, setFindWhichPage, FindWhichPage }) => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasChanged = useRef(false);

  useEffect(() => {
    const initiateChat = async () => {
      try {
        const formData = new FormData();
        formData.append("jobDescription", JSON.stringify(jobDescription));
    
        if (jobDescription.file instanceof File) {
          formData.append("file", jobDescription.file);
        }
    
        const res = await axios.post<ApiResponseFirst>("/api/interview", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
    
        if (res.data && res.data.sessionId && res.data.question ) {
          const currentTime = new Date();
          const formattedTime = currentTime.toLocaleTimeString("en-GB", {
            hour12: false,
          }); // Format as HH:MM:SS
    
          const newChatData: ChatData = {
            sessionId: res.data.sessionId,
            questions: [
              {
                question: res.data.question ,
                userResponse: null,
                actualTime: "2 minutes",
                ResponseTime: formattedTime,
                CandidateAnsweredTime: null,
              },
            ],
          };
          
          setChatData(newChatData);
          setSessionId(res.data.sessionId);
        }
      } catch (error) {
        console.error("Error initiating chat:", error);
      }
    };
    
    if (!hasChanged.current && jobDescription?.clickValue && FindWhichPage == 'interview') {
      initiateChat();
      hasChanged.current = true;
    }
  }, [jobDescription]);


  const handleSubmit = async () => {
    console.log(!sessionId,currentQuestionIndex === null ,currentResponse.trim(),'jkewk')
    if (!sessionId || currentQuestionIndex === null || currentResponse.trim() === '') return;
    const updatedQuestions = [...(chatData?.questions || [])];
    updatedQuestions[currentQuestionIndex].userResponse = currentResponse;
    updatedQuestions[currentQuestionIndex].CandidateAnsweredTime = new Date().toLocaleTimeString();

    setChatData((prev) => (prev ? { ...prev, questions: updatedQuestions } : null));
    setCurrentResponse("");
    setCurrentQuestionIndex(null);

    try {
      const patchData = {
        sessionId: sessionId,
        answer: currentResponse,
      };

      const res = await axios.patch<ApiResponse>("/api/interview", patchData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Append the new questions from PATCH response
      setChatData((prev) =>
        prev
          ? {
              ...prev,
              questions: [
                ...new Map(
                  [...prev.questions, ...res.data.questions].map((q) => [q.question, q])
                ).values(),
              ].slice(0, 10), // Ensures a maximum of 15 questions
            }
          : res.data
      );
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  useEffect(()=>{
    sessionStorage.setItem("chatData", JSON.stringify(chatData?.questions));
  },[chatData])

  return (
    <div className="w-1/2 max-h-[82vh] custom-scrollbar overflow-y-auto overflow-x-hidden">
      <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
        <span className="font-medium">Warning alert!</span> 10 questions must be answered based on the skills listed in the resume.
      </div>
      <div className="grid pb-11">
        {chatData != null && chatData?.questions?.map((q, index) => (
          <div className="flex gap-2.5 mb-4" key={index}>
            <img
              src="https://pagedone.io/asset/uploads/1710412177.png"
              alt="AI Bot"
              className="w-10 h-11"
            />
            <div className="grid">
              <div className="px-3.5 py-2 bg-gray-600 rounded max-w-[70%]">
                <h5 className="text-gray-900 text-sm">{q.question}</h5>
              </div>
              <h6 className="text-gray-500 w-16 text-xs py-1">{q.ResponseTime}</h6>
              {q.userResponse && (
                <div className="flex justify-end">
                  <div className="px-3 py-2 bg-indigo-600 rounded text-white max-w-[75%]">
                    <h5 className="text-sm">{q.userResponse}</h5>
                  </div>
                  <img
                    src="https://pagedone.io/asset/uploads/1704091591.png"
                    alt="User"
                    className="w-10 h-11 mx-5"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full pl-3 pr-1 py-1 border border-gray-200 rounded-3xl flex justify-between">
        <textarea
          className="w-full bg-transparent text-xs text-white focus:outline-none mx-5"
          placeholder="Type your response..."
          value={currentResponse}

          onChange={(e) => {
            setCurrentResponse(e.target.value);
            if(chatData != null){
            setCurrentQuestionIndex(
              chatData.questions.findIndex((q) => q.userResponse === null)
            );}
          }}
        />
        <button
          className="px-3 py-2 bg-indigo-600 rounded-full text-white"
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          onClick={()=>{currentResponse.length >=10 && handleSubmit()}}
        >
          Send
        </button>
      </div>
      <p className="text-xs mx-5">Have more than 10 character</p>
      <div className="flex justify-between my-6 m-5">
          
        {chatData != null && chatData.questions.length >= 10 && 
            <>
            <button className="flex justify-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={()=>{setFindWhichPage('preference')}}
          >
            Preference Based Q&A ✨
          </button>
        
        
          <button className="flex justify-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={()=>{setFindWhichPage('result')}}
          >
            Ready For Result ✨
          </button>
            </>
          }
      </div>
    </div>
  );
};

export default ChatInterface;