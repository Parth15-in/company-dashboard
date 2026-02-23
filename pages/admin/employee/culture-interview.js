// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import toast, { Toaster } from "react-hot-toast";

// export default function CultureInterview() {
//   const router = useRouter();

//   const [interviewId, setInterviewId] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const [listening, setListening] = useState(false);
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(true);

//   const companyId = typeof window !== "undefined" ? localStorage.getItem("companyId") : null;
//   const interviewerUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
//   const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

//   //Check if user is employee and has access
//   useEffect(() => {
//     if (!companyId || !interviewerUserId) {
//       router.push("/admin/login");
//       return;
//     }

//     // Only employees should see this page
//     if (userRole === "admin") {
//       toast.error("Only employees can take the culture interview");
//       router.push("/admin");
//       return;
//     }

//     setLoading(false);
//   }, [companyId, interviewerUserId, userRole, router]);

//   //Generate questions on load
//   useEffect(() => {
//     if (!companyId || !interviewerUserId || loading) return;

//     const init = async () => {
//       try {
//         const res = await fetch("/api/admin/employee/culture/generate-questions", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials:"include",
//           body: JSON.stringify({
//             companyId,
//             interviewerUserId,
//           }),
//         });

//         const data = await res.json();
//         if (!data.ok) throw new Error(data.error);

//         setInterviewId(data.interviewId);
//         setQuestions(data.questions);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to start interview");
//         router.push("/admin");
//       }
//     };

//     init();
//   }, [companyId, interviewerUserId, loading, router]);

//   //Speak question
//   const speakQuestion = (text) => {
//     if (!window.speechSynthesis) {
//       toast.error("Text-to-speech not supported");
//       return;
//     }
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 1;
//     utterance.pitch = 1;
//     window.speechSynthesis.speak(utterance);
//   };

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       toast.error("Speech Recognition not supported in this browser");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-IN";
//     recognition.interimResults = true;
//     recognition.continuous = false;

//     recognition.onstart = () => {
//       setListening(true);
//       setAnswer("");
//     };

//     recognition.onresult = (event) => {
//       const transcript = Array.from(event.results)
//         .map((r) => r[0].transcript)
//         .join(" ");
//       setAnswer(transcript);
//     };

//     recognition.onerror = () => {
//       setListening(false);
//       toast.error("Voice error, try again");
//     };

//     recognition.onend = () => {
//       setListening(false);
//     };

//     recognition.start();
//   };

//   const saveAndNext = async () => {
//     if (!interviewId) return;

//     try {
//       await fetch("/api/admin/employee/culture/save-answer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials:"include",
//         body: JSON.stringify({
//           interviewId,
//           index: currentIndex,
//           answer,
//         }),
//       });

//       if (currentIndex < questions.length - 1) {
//         setCurrentIndex((prev) => prev + 1);
//         setAnswer("");
//       } else {
//         await fetch("/api/admin/employee/culture/submit", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials:"include",
//           body: JSON.stringify({ interviewId, interviewerUserId }),
//         });

//         toast.success("Interview submitted successfully");
//         router.push("/admin");
//       }
//     } catch (err) {
//       toast.error("Failed to save answer");
//     }
//   };

//   if (!questions.length) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <Toaster />
//         <p className="text-lg">Preparing your interview...</p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentIndex];

//   return (
//     <div className="min-h-screen bg-black text-white p-6">
//       <Toaster position="top-center" />
//       <div className="max-w-xl mx-auto space-y-6">
//         <h1 className="text-2xl font-semibold text-center">
//           Culture Interview (Voice)
//         </h1>

//         <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
//           <p className="text-gray-400 mb-2">
//             Question {currentIndex + 1} / {questions.length}
//           </p>
//           <p className="text-lg">{currentQuestion}</p>

//           <button
//             onClick={() => speakQuestion(currentQuestion)}
//             className="mt-4 w-full bg-white text-black py-2 rounded-lg"
//           >
//           Play
//           </button>
//         </div>

//         <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
//           <p className="text-gray-400 mb-2">Your Answer:</p>
//           <textarea
//             value={answer}
//             onChange={(e) => setAnswer(e.target.value)}
//             rows={4}
//             className="w-full p-3 rounded-lg bg-black border border-gray-700"
//             placeholder="Speak or type your answer..."
//           />

//           <button
//             onClick={startListening}
//             disabled={listening}
//             className="mt-4 w-full bg-indigo-600 py-2 rounded-lg"
//           >
//             {listening ? "Listening..." : "Speak Answer"}
//           </button>

//           <button
//             onClick={saveAndNext}
//             className="mt-3 w-full bg-green-600 py-2 rounded-lg"
//           >
//             {currentIndex === questions.length - 1 ? "Submit" : "Next →"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { IoMdMicrophone, IoMdPause, IoMdPlay } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function CultureInterview() {
  const router = useRouter();
  const recognitionRef = useRef(null);

  const [interviewId, setInterviewId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [status, setStatus] = useState("idle");
  const [permanentTranscript, setPermanentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;
  const interviewerUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  /* ================= ACCESS CHECK ================= */
  useEffect(() => {
    if (!companyId || !interviewerUserId) {
      router.push("/admin/login");
      return;
    }

    if (userRole === "admin") {
      toast.error("Only employees can take this interview");
      router.push("/admin");
      return;
    }
  }, []);

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    if (!companyId || !interviewerUserId) return;

    const init = async () => {
      try {
        const res = await fetch(
          "/api/admin/employee/culture/generate-questions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ companyId, interviewerUserId }),
          }
        );

        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        setInterviewId(data.interviewId);
        setQuestions(data.questions);
      } catch (err) {
        toast.error("Failed to start interview");
        router.push("/admin");
      }
    };

    init();
  }, []);

  /* ================= START MIC ================= */
  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let finalStr = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal)
          finalStr += event.results[i][0].transcript + " ";
      }

      setPermanentTranscript((prev) => prev + finalStr);

      if (finalStr) setInterimTranscript("");
      else
        setInterimTranscript(
          event.results[event.results.length - 1][0].transcript
        );
    };

    recognition.start();
    setStatus("listening");
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  };

  const togglePause = () => {
    if (status === "listening") {
      stopRecognition();
      setStatus("paused");
    } else if (status === "paused") {
      startRecognition();
    }
  };

  /* ================= SAVE & NEXT ================= */
  const handleNext = async () => {
    stopRecognition();

    const finalAnswer =
      (permanentTranscript + interimTranscript).trim() ||
      "No Answer Recorded";

    await fetch("/api/admin/employee/culture/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        interviewId,
        index: currentIndex,
        answer: finalAnswer,
      }),
    });

    if (currentIndex < questions.length - 1) {
      setPermanentTranscript("");
      setInterimTranscript("");
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
    } else {
      await fetch("/api/admin/employee/culture/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ interviewId, interviewerUserId }),
      });

      toast.success("Interview Submitted Successfully");
      router.push("/admin");
    }
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Preparing your interview...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl bg-slate-900/80 border border-slate-700 p-12 rounded-[2rem] shadow-2xl backdrop-blur-md text-center"
      >
        <div className="mb-6">
          <span className="text-indigo-400 font-bold">
            Question {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full">
            <div
              className="h-full bg-indigo-500"
              style={{
                width: `${
                  ((currentIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8">
          {questions[currentIndex]}
        </h2>

        <div className="flex justify-center mb-8 h-24 items-center">
          {status === "listening" && (
            <div className="text-red-500 animate-pulse">
              <IoMdMicrophone className="text-6xl mx-auto" />
              REC ●
            </div>
          )}
          {status === "paused" && (
            <div className="text-yellow-500">
              <IoMdPause className="text-6xl mx-auto" />
              Paused
            </div>
          )}
        </div>

        <div className="bg-black/40 rounded-xl p-6 min-h-[120px] mb-8 text-left border border-white/5">
          {(permanentTranscript + " " + interimTranscript).trim() ||
            "Click mic and start speaking..."}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={
              status === "idle" ? startRecognition : togglePause
            }
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
          >
            {status === "listening" ? <IoMdPause /> : <IoMdPlay />}
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2"
          >
            {currentIndex === questions.length - 1
              ? "Submit Interview"
              : "Next"}
            <FaArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
