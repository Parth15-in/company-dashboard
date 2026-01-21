// // pages/admin/Mock/questionForm.jsx
// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/router";
// import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
// import { FcSpeaker } from "react-icons/fc";

// export default function QuestionForm() {
//   const router = useRouter();

//   /* ================= STATE ================= */
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [recordedText, setRecordedText] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [email, setEmail] = useState("");
//   const [jobRoleId, setJobRoleId] = useState("");

//   const recognitionRef = useRef(null);

//   /* ================= LOAD CONTEXT ================= */
//   useEffect(() => {
//     const candidateEmail = localStorage.getItem("candidateEmail");
//     const id = localStorage.getItem("_id");

//     if (!candidateEmail || !id) {
//       alert("Interview session expired.");
//       router.push("/");
//       return;
//     }

//     setEmail(candidateEmail);
//     setJobRoleId(id);
//   }, [router]);

//   /* ================= FETCH QUESTIONS ================= */
//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(
//           `/api/admin/mock/fetchQuestionsFormDb?email=${email}&_id=${jobRoleId}`
//         );

//         const data = await res.json();
//         if (!Array.isArray(data) || data.length === 0) {
//           alert("No questions found");
//           return;
//         }

//         setQuestions(data);
//         setCurrentQuestionIndex(0);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to load questions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [jobRoleId, email]);

//   /* ================= SPEECH RECOGNITION ================= */
//   useEffect(() => {
//     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
//       return;

//     const SR =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SR();

//     recognition.lang = "en-US";
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (e) => {
//       const transcript = Array.from(e.results)
//         .map((r) => r[0].transcript)
//         .join(" ");
//       setRecordedText(transcript);
//     };

//     recognition.onend = () => setIsListening(false);

//     recognitionRef.current = recognition;

//     return () => recognition.stop();
//   }, []);

//   /* ================= AI SPEAK ================= */
//   const speakQuestion = (text) => {
//     if (!window.speechSynthesis) return;

//     window.speechSynthesis.cancel();
//     setIsSpeaking(true);

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "en-US";
//     utterance.rate = 0.9;

//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);

//     window.speechSynthesis.speak(utterance);
//   };

//   /* ================= SAVE ANSWER ================= */
//   const submitAnswer = async () => {
//     const q = questions[currentQuestionIndex];
//     if (!q?._id) return;

//     try {
//       await fetch("/api/admin/mock/saveAnswer", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           _id: jobRoleId,
//           email,
//           questionId: q._id,
//           answer: recordedText || "No answer",
//         }),
//       });
//     } catch (err) {
//       console.error("Save answer failed", err);
//     }
//   };

//   /* ================= MIC HANDLER ================= */
//   const toggleMic = async () => {
//     if (!recognitionRef.current) return;

//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//       await submitAnswer();
//     } else {
//       setRecordedText("");
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   /* ================= NEXT QUESTION ================= */
//   const nextQuestion = async () => {
//     await submitAnswer();

//     if (currentQuestionIndex >= questions.length - 1) {
//       // LAST QUESTION
//       localStorage.setItem("_idForReport", jobRoleId);
//       localStorage.removeItem("_id");
//       router.push("/admin/Mock/report");
//       return;
//     }

//     setRecordedText("");
//     setCurrentQuestionIndex((i) => i + 1);
//   };

//   /* ================= AUTO SPEAK QUESTION ================= */
//   useEffect(() => {
//     if (questions.length > 0) {
//       speakQuestion(questions[currentQuestionIndex].questionText);
//     }
//   }, [currentQuestionIndex, questions]);

//   /* ================= UI ================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         Loading questions...
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
//       <h2 className="text-lg mb-2">
//         Question {currentQuestionIndex + 1} / {questions.length}
//       </h2>

//       <div className="bg-white text-black rounded-xl p-6 max-w-xl w-full text-center text-lg">
//         {currentQuestion?.questionText}
//       </div>

//       <button
//         onClick={() => speakQuestion(currentQuestion.questionText)}
//         className="mt-4 flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full"
//         disabled={isSpeaking}
//       >
//         <FcSpeaker /> Listen Again
//       </button>

//       <button
//         onClick={toggleMic}
//         className={`mt-8 p-6 rounded-full text-white text-3xl ${
//           isListening ? "bg-red-600" : "bg-pink-600"
//         }`}
//         disabled={isSpeaking}
//       >
//         {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
//       </button>

//       <p className="mt-3 text-gray-400">
//         {isListening ? "Listening..." : "Tap to speak"}
//       </p>

//       {/* MANUAL NEXT */}
//       <button
//         onClick={nextQuestion}
//         className="mt-8 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-lg"
//         disabled={isListening}
//       >
//         {currentQuestionIndex === questions.length - 1
//           ? "Finish Interview"
//           : "Next Question"}
//       </button>
//     </div>
//   );
// }


// pages/admin/mock/questionForm.js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";

export default function QuestionForm() {
  const router = useRouter();

  /* ================= CORE STATE ================= */
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedText, setRecordedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isIphone, setIsIphone] = useState(false);

  /* ================= IDENTIFIERS ================= */
  const [email, setEmail] = useState("");
  const [interviewId, setInterviewId] = useState("");

  /* ================= REFS ================= */
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  /* ================= INIT ================= */
  useEffect(() => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setIsIphone(true);
    }

    const candidateEmail = localStorage.getItem("candidateEmail");
    const _id = localStorage.getItem("_id");

    if (!candidateEmail || !_id) {
      router.push("/");
      return;
    }

    setEmail(candidateEmail);
    setInterviewId(_id);
  }, []);

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    if (!interviewId) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/admin/mock/fetchQuestionsFormDb?_id=${interviewId}&email=${email}`
        );
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          alert("No questions found");
          router.push("/");
          return;
        }

        setQuestions(data);
        setCurrentQuestionIndex(0);
      } catch (err) {
        console.error(err);
        alert("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewId, email]);

  /* ================= SPEECH RECOGNITION ================= */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setRecordedText(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  /* ================= AI SPEAK ================= */
  const speakQuestion = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    utterance.onend = () => {
      setIsSpeaking(false);
      startTimer();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      startTimer();
    };

    window.speechSynthesis.speak(utterance);
  };

  /* ================= TIMER ================= */
  const startTimer = () => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (!isListening) {
        submitAnswer("No answer - timed out");
        goNext("auto");
      }
    }, 20000); // 20 sec
  };

  /* ================= SAVE ANSWER ================= */
  const submitAnswer = async (answerText) => {
    const q = questions[currentQuestionIndex];
    if (!q?._id) return;

    try {
      await fetch("/api/admin/mock/saveAnswer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: interviewId,
          email,
          questionId: q._id,
          answer: answerText || recordedText || "No answer",
        }),
      });
    } catch (err) {
      console.error("Save answer failed", err);
    }
  };

  /* ================= MIC TOGGLE ================= */
  const handleMicClick = async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      await submitAnswer(recordedText);
      goNext("mic");
    } else {
      clearTimeout(timerRef.current);
      setRecordedText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /* ================= NEXT ================= */
  const goNext = (mode) => {
    clearTimeout(timerRef.current);

    if (currentQuestionIndex >= questions.length - 1) {
      // IMPORTANT: store jobRole/interview id for report
      localStorage.setItem("_idForReport", interviewId);
      localStorage.removeItem("_id");

      router.push("/admin/mock/report");
      return;
    }


    setRecordedText("");
    setCurrentQuestionIndex((i) => i + 1);
  };

  /* ================= AUTO SPEAK ON QUESTION CHANGE ================= */
  useEffect(() => {
    if (questions.length > 0) {
      speakQuestion(questions[currentQuestionIndex]?.questionText);
    }
    return () => clearTimeout(timerRef.current);
  }, [currentQuestionIndex, questions]);

  /* ================= UI ================= */
  if (loading) {
    return <div className="text-white text-center mt-20">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      {questions.length > 0 && (
        <div className="w-full max-w-xl bg-[#D2E9FA] p-8 rounded-2xl shadow-2xl">

          {/* Progress */}
          <div className="mb-6">
            <p className="text-gray-700 text-sm mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          {/* <h2 className="text-2xl font-bold text-center text-black mb-4">
            Question:
          </h2> */}

          <div className="bg-white rounded-xl px-6 py-4 text-lg text-center text-black mb-6">
            {questions[currentQuestionIndex]?.questionText}
          </div>

          {/* Listen Again */}
          <button
            onClick={() =>
              speakQuestion(questions[currentQuestionIndex]?.questionText)
            }
            disabled={isSpeaking}
            className="mx-auto mb-4 flex items-center justify-center px-6 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition"
          >
            🔊 Listen Again
          </button>

          {/* AI Speaking */}
          {isSpeaking && (
            <div className="flex justify-center mb-6">
              <span className="px-4 py-1 rounded-full bg-green-500 text-white text-sm animate-pulse">
                AI Speaking...
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-10 mt-10">

            {/* Mic */}
            <button
              onClick={handleMicClick}
              disabled={isSpeaking}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition ${isListening
                ? "bg-red-600 animate-pulse"
                : "bg-gradient-to-br from-indigo-500 to-pink-500"
                }`}
            >
              {isListening ? (
                <FaMicrophoneSlash className="text-3xl" />
              ) : (
                <FaMicrophone className="text-3xl" />
              )}
              <span className="text-xs mt-1">
                {isListening ? "Stop" : "Start"}
              </span>
            </button>

            {/* Next */}
            <button
              onClick={() => {
                submitAnswer(recordedText);
                goNext("manual");
              }}

              disabled={isListening || isSpeaking}
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 hover:scale-105 transition disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="text-xs mt-1">Next</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}