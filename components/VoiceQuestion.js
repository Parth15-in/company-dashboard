// // components/VoiceQuestion.jsx
// "use client";
// import { useEffect, useRef, useState } from "react";

// /**
//  * VoiceQuestion
//  * Props:
//  * - sessionId: string
//  * - section: 'technical'|'softskill'
//  * - questionIndex: number
//  * - prompt: string
//  */
// export default function VoiceQuestion({ sessionId, section, questionIndex, prompt }) {
//   const [isListening, setIsListening] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const recognitionRef = useRef(null);
//   const [micPermission, setMicPermission] = useState("unknown"); // "unknown"|"granted"|"denied"

//   // Initialize SpeechRecognition with auto-restart
//   const setupSpeechRecognition = (onTranscriptUpdate) => {
//     if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
//       return null;
//     }
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognitionInstance = new SpeechRecognition();

//     recognitionInstance.lang = "en-US";
//     recognitionInstance.continuous = true;
//     recognitionInstance.interimResults = true;
//     recognitionInstance.maxAlternatives = 1;

//     let currentTranscript = "";

//     recognitionInstance.onstart = () => {
//       // reset partial transcript for a fresh recording
//       if (!isSubmitted) {
//         currentTranscript = "";
//         onTranscriptUpdate("");
//       }
//       setIsListening(true);
//     };

//     recognitionInstance.onresult = (event) => {
//       if (event.results && event.results.length > 0) {
//         const lastResult = event.results[event.results.length - 1];
//         const latestTranscript = lastResult[0].transcript || "";

//         if (lastResult.isFinal) {
//           currentTranscript = (currentTranscript + " " + latestTranscript).replace(/\s+/g, " ").trim();
//         }

//         const fullTranscript = (currentTranscript + " " + (lastResult.isFinal ? "" : latestTranscript)).replace(/\s+/g, " ").trim();
//         onTranscriptUpdate(fullTranscript);
//       }
//     };

//     recognitionInstance.onend = () => {
//       setIsListening(false);
//       // auto-restart if still recording and user didn't explicitly request stop
//       if (!isSubmitted && isRecording && !window.stopRecognitionRequested) {
//         setTimeout(() => {
//           try {
//             recognitionInstance.start();
//           } catch (e) {
//             console.warn("Auto-restart failed", e);
//             setIsListening(false);
//           }
//         }, 120);
//       }
//     };

//     recognitionInstance.onerror = (event) => {
//       console.error("Speech recognition error:", event);
//       switch (event.error) {
//         case "no-speech":
//           // keep listening
//           break;
//         case "not-allowed":
//         case "permission-denied":
//         case "audio-capture":
//           setMicPermission("denied");
//           setIsListening(false);
//           break;
//         default:
//           break;
//       }
//     };

//     return recognitionInstance;
//   };

//   // Start recording + recognition
//   const start = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setMicPermission("granted");

//       // MediaRecorder
//       const mediaRecorder = new MediaRecorder(stream);
//       recordedChunksRef.current = [];
//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
//       };
//       mediaRecorder.onstop = () => {
//         // release tracks
//         try {
//           stream.getTracks().forEach((t) => t.stop());
//         } catch (e) {}
//       };
//       mediaRecorder.start();
//       mediaRecorderRef.current = mediaRecorder;
//       setIsRecording(true);

//       // SpeechRecognition
//       const recognition = setupSpeechRecognition((t) => setRecordedText(t));
//       recognitionRef.current = recognition;
//       window.stopRecognitionRequested = false;
//       if (recognition) {
//         try {
//           recognition.start();
//         } catch (e) {
//           console.warn("recognition.start() error:", e);
//         }
//       } else {
//         console.warn("SpeechRecognition not supported");
//       }
//     } catch (err) {
//       console.error("getUserMedia error:", err);
//       setMicPermission("denied");
//       setIsRecording(false);
//       setIsListening(false);
//       alert("Please allow microphone access to record your answer.");
//     }
//   };

//   // Stop recording + recognition
//   const stop = () => {
//     window.stopRecognitionRequested = true;
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.warn("recognition stop err:", e);
//       }
//     }
//     setIsListening(false);

//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       try {
//         mediaRecorderRef.current.stop();
//       } catch (e) {
//         console.warn("mediaRecorder stop err:", e);
//       }
//     }
//     setIsRecording(false);
//   };

//   // Submit transcript + audio
//   const submit = async () => {
//     setIsSubmitted(true);
//     if (isRecording) stop();

//     let audioBlob = null;
//     if (recordedChunksRef.current && recordedChunksRef.current.length) {
//       audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
//     }

//     const fd = new FormData();
//     fd.append("sessionId", sessionId);
//     fd.append("section", section);
//     fd.append("questionIndex", String(questionIndex));
//     fd.append("transcript", recordedText || "");
//     if (audioBlob) fd.append("audio", audioBlob, `session-${sessionId}-${section}-${questionIndex}.webm`);

//     try {
//       const res = await fetch("/api/admin/interviews/upload-audio", {
//         method: "POST",
//         body: fd,
//       });
//       const j = await res.json();
//       if (j.ok) {
//         // Optionally show success UI rather than alert
//         alert("Voice answer submitted.");
//       } else {
//         alert("Submit failed: " + (j.error || "unknown"));
//         setIsSubmitted(false);
//       }
//     } catch (err) {
//       console.error("submit error", err);
//       alert("Submission error");
//       setIsSubmitted(false);
//     }
//   };

//   // cleanup on unmount
//   useEffect(() => {
//     return () => {
//       window.stopRecognitionRequested = true;
//       try {
//         if (recognitionRef.current) {
//           recognitionRef.current.onend = null;
//           recognitionRef.current.stop();
//         }
//       } catch (e) {}
//       try {
//         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//           mediaRecorderRef.current.stop();
//         }
//       } catch (e) {}
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="border rounded p-4 my-3">
//       <div className="mb-2">
//         <div className="font-medium">{questionIndex + 1}. {prompt}</div>
//         <div className="text-sm text-gray-600">Answer using your voice. Live transcript shown below.</div>
//       </div>

//       <div className="mb-3">
//         <div className="p-3 bg-gray-50 rounded min-h-[66px]">
//           {recordedText ? (
//             <div className="whitespace-pre-wrap">{recordedText}</div>
//           ) : (
//             <div className="text-sm text-gray-400">No speech detected yet</div>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         {!isRecording && !isSubmitted && (
//           <button onClick={start} className="px-3 py-1 bg-blue-600 text-white rounded">Start Recording</button>
//         )}

//         {isRecording && (
//           <button onClick={stop} className="px-3 py-1 bg-red-600 text-white rounded">Stop Recording</button>
//         )}

//         <button
//           onClick={submit}
//           className="px-3 py-1 bg-green-600 text-white rounded"
//           disabled={isSubmitted}
//         >
//           {isSubmitted ? "Submitted" : "Submit Answer"}
//         </button>

//         {micPermission === "denied" && (
//           <div className="text-sm text-red-600 ml-3">Microphone permission denied. Please allow mic access.</div>
//         )}

//         {isListening && <div className="ml-3 text-sm text-green-600">Listening…</div>}
//       </div>
//     </div>
//   );
// }



// // components/VoiceQuestion.jsx
// "use client";
// import { useEffect, useRef, useState } from "react";

// /**
//  * VoiceQuestion
//  * Props:
//  * - sessionId: string
//  * - section: 'technical'|'softskill'
//  * - questionIndex: number
//  * - prompt: string
//  */
// export default function VoiceQuestion({ sessionId, section, questionIndex, prompt }) {
//   const [isListening, setIsListening] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [micPermission, setMicPermission] = useState("unknown"); // "unknown"|"granted"|"denied"
//   const [noSpeechWarning, setNoSpeechWarning] = useState(false);

//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const recognitionRef = useRef(null);
//   const streamRef = useRef(null);

//   // live refs to avoid stale closures in handlers
//   const isRecordingRef = useRef(isRecording);
//   const isSubmittedRef = useRef(isSubmitted);
//   const isListeningRef = useRef(isListening);

//   useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
//   useEffect(() => { isSubmittedRef.current = isSubmitted; }, [isSubmitted]);
//   useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

//   // no-speech handling/backoff refs
//   const noSpeechCountRef = useRef(0);
//   const lastErrorRef = useRef(null);
//   const backoffTimerRef = useRef(null);

//   const MAX_NO_SPEECH_BEFORE_BACKOFF = 3;
//   const BACKOFF_MS = 2000;

//   const createRecognition = (onTranscriptUpdate) => {
//     if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) return null;
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const rec = new SpeechRecognition();

//     rec.lang = "en-US";
//     rec.continuous = true;
//     rec.interimResults = true;
//     rec.maxAlternatives = 1;

//     let confirmedTranscript = "";

//     rec.onstart = () => {
//       lastErrorRef.current = null;
//       setIsListening(true);
//       confirmedTranscript = "";
//       onTranscriptUpdate("");
//       // reset warning when recognition actually starts
//       setNoSpeechWarning(false);
//     };

//     rec.onresult = (event) => {
//       if (!event.results || event.results.length === 0) return;
//       let interim = "";
//       for (let i = 0; i < event.results.length; i++) {
//         const result = event.results[i];
//         const t = result[0]?.transcript || "";
//         if (result.isFinal) {
//           confirmedTranscript = (confirmedTranscript + " " + t).replace(/\s+/g, " ").trim();
//         } else {
//           interim += " " + t;
//         }
//       }
//       const full = (confirmedTranscript + " " + interim).replace(/\s+/g, " ").trim();
//       onTranscriptUpdate(full);
//     };

//     rec.onerror = (e) => {
//       // Save the last error for onend logic
//       lastErrorRef.current = e.error;
//       console.warn("SpeechRecognition error:", e);

//       switch (e.error) {
//         case "no-speech":
//           // don't mark permission denied — just note it and allow onend to decide restart/backoff
//           break;
//         case "not-allowed":
//         case "permission-denied":
//         case "audio-capture":
//           setMicPermission("denied");
//           setIsListening(false);
//           break;
//         default:
//           // other errors — leave to onend to possibly restart
//           break;
//       }
//     };

//     rec.onend = () => {
//       setIsListening(false);

//       // If recording was stopped intentionally or submission happened, do nothing
//       if (!isRecordingRef.current || isSubmittedRef.current) return;

//       // If the last error was "no-speech", increment count & possibly backoff
//       if (lastErrorRef.current === "no-speech") {
//         noSpeechCountRef.current = (noSpeechCountRef.current || 0) + 1;
//       } else {
//         // clear no-speech counter on successful speech or other errors
//         noSpeechCountRef.current = 0;
//       }

//       if (noSpeechCountRef.current >= MAX_NO_SPEECH_BEFORE_BACKOFF) {
//         // show UI warning and set a backoff before trying again
//         setNoSpeechWarning(true);
//         if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
//         backoffTimerRef.current = setTimeout(() => {
//           noSpeechCountRef.current = 0;
//           setNoSpeechWarning(false);
//           // attempt restart only if still recording
//           if (isRecordingRef.current && recognitionRef.current) {
//             try { recognitionRef.current.start(); } catch (err) { console.warn("auto-restart after backoff failed", err); }
//           }
//         }, BACKOFF_MS);
//         return;
//       }

//       // Otherwise try a quick restart (small debounce)
//       setTimeout(() => {
//         if (!isListeningRef.current && isRecordingRef.current && recognitionRef.current) {
//           try { recognitionRef.current.start(); } catch (err) { console.warn("recognition auto-restart failed", err); }
//         }
//       }, 120);
//     };

//     return rec;
//   };

//   const start = async () => {
//     if (isRecordingRef.current) return;

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setMicPermission("granted");
//       streamRef.current = stream;

//       // MediaRecorder
//       const mediaRecorder = new MediaRecorder(stream);
//       recordedChunksRef.current = [];
//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
//       };
//       mediaRecorder.onstop = () => {
//         try { stream.getTracks().forEach((t) => t.stop()); } catch (e) {}
//       };
//       mediaRecorderRef.current = mediaRecorder;
//       mediaRecorder.start();

//       setIsRecording(true);

//       // Setup recognition
//       noSpeechCountRef.current = 0;
//       lastErrorRef.current = null;
//       setNoSpeechWarning(false);

//       const recognition = createRecognition((t) => setRecordedText(t));
//       recognitionRef.current = recognition;

//       if (recognition) {
//         try { recognition.start(); } catch (e) { console.warn("recognition.start() error:", e); }
//       } else {
//         console.warn("SpeechRecognition not supported");
//       }
//     } catch (err) {
//       console.error("getUserMedia error:", err);
//       setMicPermission("denied");
//       setIsRecording(false);
//       setIsListening(false);
//       alert("Please allow microphone access to record your answer.");
//     }
//   };

//   const stop = () => {
//     setIsRecording(false);

//     // stop recognition gracefully
//     const rec = recognitionRef.current;
//     if (rec) {
//       try {
//         rec.onend = rec.onerror = rec.onresult = rec.onstart = null;
//         rec.stop();
//       } catch (e) { console.warn("recognition stop err:", e); }
//       recognitionRef.current = null;
//     }
//     setIsListening(false);

//     // stop media recorder
//     const mr = mediaRecorderRef.current;
//     if (mr && mr.state !== "inactive") {
//       try { mr.stop(); } catch (e) { console.warn("mediaRecorder stop err:", e); }
//     }
//     mediaRecorderRef.current = null;

//     try {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//         streamRef.current = null;
//       }
//     } catch (e) {}
//   };

//   const submit = async () => {
//     if (isSubmittedRef.current) return;
//     if (isRecordingRef.current) stop();

//     setIsSubmitted(true);

//     let audioBlob = null;
//     if (recordedChunksRef.current && recordedChunksRef.current.length) {
//       try {
//         audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
//       } catch (e) {
//         audioBlob = new Blob(recordedChunksRef.current);
//       }
//     }

//     const fd = new FormData();
//     fd.append("sessionId", sessionId);
//     fd.append("section", section);
//     fd.append("questionIndex", String(questionIndex));
//     fd.append("transcript", recordedText || "");
//     if (audioBlob) fd.append("audio", audioBlob, `session-${sessionId}-${section}-${questionIndex}.webm`);

//     try {
//       const res = await fetch("/api/admin/interviews/upload-audio", { method: "POST", body: fd });
//       const j = await res.json();
//       if (j.ok) {
//         alert("Voice answer submitted.");
//       } else {
//         alert("Submit failed: " + (j.error || "unknown"));
//         setIsSubmitted(false);
//       }
//     } catch (err) {
//       console.error("submit error", err);
//       alert("Submission error");
//       setIsSubmitted(false);
//     }
//   };

//   // cleanup on unmount
//   useEffect(() => {
//     return () => {
//       isRecordingRef.current = false;
//       isSubmittedRef.current = true;
//       try {
//         if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; }
//       } catch (e) {}
//       try { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop(); } catch (e) {}
//       try { if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; } } catch (e) {}
//       if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="border rounded p-4 my-3">
//       <div className="mb-2">
//         <div className="font-medium">{questionIndex + 1}. {prompt}</div>
//         <div className="text-sm text-gray-600">Answer using your voice. Live transcript shown below.</div>
//       </div>

//       <div className="mb-3">
//         <div className="p-3 bg-gray-50 rounded min-h-[66px]">
//           {recordedText ? (
//             <div className="whitespace-pre-wrap">{recordedText}</div>
//           ) : (
//             <div className="text-sm text-gray-400">No speech detected yet</div>
//           )}
//         </div>
//         {noSpeechWarning && (
//           <div className="text-sm text-yellow-700 mt-2">No speech detected — please check your mic or speak louder.</div>
//         )}
//       </div>

//       <div className="flex items-center gap-2">
//         {!isRecording && !isSubmitted && (
//           <button onClick={start} className="px-3 py-1 bg-blue-600 text-white rounded">Start Recording</button>
//         )}

//         {isRecording && (
//           <button onClick={stop} className="px-3 py-1 bg-red-600 text-white rounded">Stop Recording</button>
//         )}

//         <button
//           onClick={submit}
//           className="px-3 py-1 bg-green-600 text-white rounded"
//           disabled={isSubmitted || isRecording}
//         >
//           {isSubmitted ? "Submitted" : "Submit Answer"}
//         </button>

//         {micPermission === "denied" && (
//           <div className="text-sm text-red-600 ml-3">Microphone permission denied. Please allow mic access.</div>
//         )}

//         {isListening && <div className="ml-3 text-sm text-green-600">Listening…</div>}
//       </div>
//     </div>
//   );
// }


// components/VoiceQuestion.jsx
"use client";
import { useEffect, useRef, useState } from "react";

/**
 * VoiceQuestion
 * Props:
 * - sessionId: string
 * - section: 'technical'|'softskill'
 * - questionIndex: number
 * - prompt: string
 */
export default function VoiceQuestion({ sessionId, section, questionIndex, prompt,onSubmitSuccess }) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [rawTranscript, setRawTranscript] = useState("");
  const [cleanTranscript, setCleanTranscript] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [micPermission, setMicPermission] = useState("unknown"); // unknown|granted|denied
  const [noSpeechWarning, setNoSpeechWarning] = useState(false);
  const [levelWarning, setLevelWarning] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioBlobRef = useRef(null);

  // live refs used in callbacks to avoid stale closure issues
  const isRecordingRef = useRef(isRecording);
  const isSubmittedRef = useRef(isSubmitted);
  const isListeningRef = useRef(isListening);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isSubmittedRef.current = isSubmitted; }, [isSubmitted]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // no-speech/backoff refs
  const noSpeechCountRef = useRef(0);
  const lastErrorRef = useRef(null);
  const backoffTimerRef = useRef(null);
  const MAX_NO_SPEECH_BEFORE_BACKOFF = 3;
  const BACKOFF_MS = 2500;

  /* -----------------------
     Utilities
     ----------------------- */

  // Collapse repeated blocks and simple stutters
  function collapseRepeatedBlocks(text) {
    if (!text || typeof text !== "string") return "";

    // normalize whitespace
    text = text.replace(/\s+/g, " ").trim();

    // collapse long repeated single-word stutters (3+)
    text = text.replace(/\b(\w+)(?:\s+\1){2,}\b/gi, "$1");

    // try to find repeated blocks
    const tokens = text.split(" ");
    const n = tokens.length;
    for (let blockSize = 1; blockSize <= Math.floor(n / 2); blockSize++) {
      let i = 0;
      const out = [];
      let changed = false;

      while (i < n) {
        const block = tokens.slice(i, i + blockSize).join(" ");
        let repeat = 1;
        while (
          i + repeat * blockSize + blockSize - 1 < n &&
          tokens.slice(i + repeat * blockSize, i + (repeat + 1) * blockSize).join(" ") === block
        ) {
          repeat++;
        }

        if (repeat > 1) {
          out.push(block);
          i += repeat * blockSize;
          changed = true;
        } else {
          out.push(tokens[i]);
          i += 1;
        }
      }

      if (changed) {
        const candidate = out.join(" ");
        // recursively collapse nested patterns
        return collapseRepeatedBlocks(candidate);
      }
    }

    return text;
  }

  // sample audio RMS level to detect muted/very quiet mics
  const sampleAudioLevel = async (stream, sampleMs = 700) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const start = performance.now();
    let sum = 0, count = 0;
    while (performance.now() - start < sampleMs) {
      analyser.getByteTimeDomainData(data);
      let s = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        s += v * v;
      }
      const rms = Math.sqrt(s / data.length);
      sum += rms;
      count++;
      await new Promise((r) => setTimeout(r, 60));
    }
    audioCtx.close();
    return sum / Math.max(1, count);
  };

  /* -----------------------
     SpeechRecognition setup
     ----------------------- */

  const createRecognition = (onTranscriptUpdate) => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let confirmedTranscript = "";

    rec.onstart = () => {
      lastErrorRef.current = null;
      setIsListening(true);
      confirmedTranscript = "";
      onTranscriptUpdate("");
      setNoSpeechWarning(false);
    };

    rec.onresult = (event) => {
      if (!event.results || event.results.length === 0) return;
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const t = result[0]?.transcript || "";
        if (result.isFinal) {
          confirmedTranscript = (confirmedTranscript + " " + t).replace(/\s+/g, " ").trim();
        } else {
          interim += " " + t;
        }
      }
      const full = (confirmedTranscript + " " + interim).replace(/\s+/g, " ").trim();
      onTranscriptUpdate(full);
    };

    rec.onspeechstart = () => {
      // user spoke — reset counters and warnings
      noSpeechCountRef.current = 0;
      setNoSpeechWarning(false);
      setLevelWarning(false);
    };

    rec.onerror = (e) => {
      lastErrorRef.current = e.error;
      console.warn("SpeechRecognition error:", e);
      if (e.error === "not-allowed" || e.error === "permission-denied" || e.error === "audio-capture") {
        setMicPermission("denied");
        setIsListening(false);
      }
    };

    rec.onend = () => {
      setIsListening(false);

      if (!isRecordingRef.current || isSubmittedRef.current) return;

      if (lastErrorRef.current === "no-speech") {
        noSpeechCountRef.current = (noSpeechCountRef.current || 0) + 1;
      } else {
        noSpeechCountRef.current = 0;
      }

      if (noSpeechCountRef.current >= MAX_NO_SPEECH_BEFORE_BACKOFF) {
        setNoSpeechWarning(true);
        if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
        backoffTimerRef.current = setTimeout(() => {
          noSpeechCountRef.current = 0;
          setNoSpeechWarning(false);
          if (isRecordingRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (err) { console.warn("auto-restart failed", err); }
          }
        }, BACKOFF_MS);
        return;
      }

      // quick restart
      setTimeout(() => {
        if (!isListeningRef.current && isRecordingRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (err) { console.warn("quick restart failed", err); }
        }
      }, 120);
    };

    return rec;
  };

  /* -----------------------
     Start / Stop / Retry / Submit
     ----------------------- */

  const start = async () => {
    if (isRecordingRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission("granted");

      // pre-check audio level
      let rms = 0;
      try {
        rms = await sampleAudioLevel(stream, 600);
      } catch (e) {
        console.warn("audio-level precheck failed:", e);
      }

      const LEVEL_THRESHOLD = 0.01;
      if (rms < LEVEL_THRESHOLD) {
        setLevelWarning(true);
        // bump counter to reduce immediate retries
        noSpeechCountRef.current = Math.max(1, noSpeechCountRef.current);
      } else {
        setLevelWarning(false);
      }

      // set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        try { stream.getTracks().forEach((t) => t.stop()); } catch (e) {}
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      noSpeechCountRef.current = 0;
      lastErrorRef.current = null;
      setNoSpeechWarning(false);
      setRawTranscript("");
      setCleanTranscript("");
      setAudioUrl(null);
      audioBlobRef.current = null;

      const recognition = createRecognition((t) => setRawTranscript(t));
      recognitionRef.current = recognition;
      if (recognition) {
        try { recognition.start(); } catch (e) { console.warn("recognition.start error", e); }
      } else {
        console.warn("SpeechRecognition unsupported in this browser");
      }
    } catch (err) {
      console.error("getUserMedia error:", err);
      setMicPermission("denied");
      setIsRecording(false);
      setIsListening(false);
      alert("Please allow microphone access to record your answer.");
    }
  };

  const stop = () => {
    setIsRecording(false);

    // stop recognition
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onend = rec.onerror = rec.onresult = rec.onstart = rec.onspeechstart = null;
        rec.stop();
      } catch (e) { console.warn("recognition stop err:", e); }
      recognitionRef.current = null;
    }
    setIsListening(false);

    // stop media recorder
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch (e) { console.warn("mediaRecorder stop err:", e); }
    }
    mediaRecorderRef.current = null;

    // assemble audio blob & URL
    if (recordedChunksRef.current && recordedChunksRef.current.length) {
      try {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (e) {
        console.warn("creating audio blob failed", e);
      }
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch (e) {}
    // prepare cleaned transcript for preview (collapse repeats)
    const cleaned = collapseRepeatedBlocks(rawTranscript || "");
    setCleanTranscript(cleaned);
  };

  const retry = () => {
    // reset everything and start again
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      recordedChunksRef.current = [];
      audioBlobRef.current = null;
      setRawTranscript("");
      setCleanTranscript("");
      setIsSubmitted(false);
      setNoSpeechWarning(false);
      setLevelWarning(false);
      // stop any running recognition/media
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
        mediaRecorderRef.current = null;
      }
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; } catch (e) {}
      }
    } catch (e) {}
    start();
  };

  const submit = async () => {
    if (isSubmittedRef.current) return;
    if (isRecordingRef.current) stop();
    setIsSubmitted(true);

    // If user edited cleaned transcript in UI, use that; else collapse raw.
    const finalTranscript = (cleanTranscript && cleanTranscript.trim().length) ? cleanTranscript.trim() : collapseRepeatedBlocks(rawTranscript || "");

    let audioBlob = audioBlobRef.current;
    if (!audioBlob && recordedChunksRef.current && recordedChunksRef.current.length) {
      try {
        audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      } catch (e) {
        audioBlob = new Blob(recordedChunksRef.current);
      }
    }

    const fd = new FormData();
    fd.append("sessionId", sessionId);
    fd.append("section", section);
    fd.append("questionIndex", String(questionIndex));
    fd.append("transcript", finalTranscript);
    if (audioBlob) fd.append("audio", audioBlob, `session-${sessionId}-${section}-${questionIndex}.webm`);

    try {
      const res = await fetch("/api/admin/interviews/upload-audio", { method: "POST", body: fd });
      const j = await res.json();
      if (j.ok) {
        alert("Voice answer submitted.");
        if (onSubmitSuccess) onSubmitSuccess(section, questionIndex);

      } else {
        alert("Submit failed: " + (j.error || "unknown"));
        setIsSubmitted(false);
      }
    } catch (err) {
      console.error("submit error", err);
      alert("Submission error");
      setIsSubmitted(false);
    }
  };

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      isSubmittedRef.current = true;
      try {
        if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; }
      } catch (e) {}
      try { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop(); } catch (e) {}
      try { if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; } } catch (e) {}
      if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -----------------------
     Render UI
     ----------------------- */

  return (
    <div className="border rounded p-4 my-3">
      <div className="mb-2">
        <div className="font-medium">{questionIndex + 1}. {prompt}</div>
        <div className="text-sm text-gray-600">Answer using your voice. Live transcript shown below.</div>
      </div>

      <div className="mb-3">
        <div className="p-3 bg-gray-50 rounded min-h-[66px]">
          {/* Show raw or cleaned transcript while recording, but prefer raw updating live */}
          {isRecording ? (
            rawTranscript ? <div className="whitespace-pre-wrap">{rawTranscript}</div> : <div className="text-sm text-gray-400">Listening… speak now</div>
          ) : (
            cleanTranscript ? (
              <div>
                <div className="whitespace-pre-wrap">{cleanTranscript}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No speech detected yet</div>
            )
          )}
        </div>

        {levelWarning && <div className="text-sm text-yellow-700 mt-2">Microphone seems very quiet — try increasing input volume or move closer to the mic.</div>}
        {noSpeechWarning && <div className="text-sm text-yellow-700 mt-2">No speech detected repeatedly — please check your mic or speak louder. We'll retry shortly.</div>}
      </div>

      {/* Audio playback and edit area */}
      {!isRecording && audioUrl && (
        <div className="mb-3 flex items-center gap-3">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {!isRecording && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cleaned transcript (editable)</label>
          <textarea
            value={cleanTranscript}
            onChange={(e) => setCleanTranscript(e.target.value)}
            placeholder="Cleaned transcript will appear here — edit if needed before submitting"
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !isSubmitted && (
          <button onClick={start} className="px-3 py-1 bg-blue-600 text-white rounded">Start Recording</button>
        )}

        {isRecording && (
          <button onClick={stop} className="px-3 py-1 bg-red-600 text-white rounded">Stop Recording</button>
        )}

        {!isRecording && (
          <button
            onClick={retry}
            className="px-3 py-1 bg-yellow-500 text-white rounded"
            disabled={isRecording}
          >
            Retry
          </button>
        )}

        <button
          onClick={submit}
          className="px-3 py-1 bg-green-600 text-white rounded"
          disabled={isSubmitted || isRecording}
        >
          {isSubmitted ? "Submitted" : "Submit Answer"}
        </button>

        {micPermission === "denied" && <div className="text-sm text-red-600 ml-3">Microphone permission denied. Please allow mic access.</div>}
        {isListening && <div className="ml-3 text-sm text-green-600">Listening…</div>}
      </div>
    </div>
  );
}
