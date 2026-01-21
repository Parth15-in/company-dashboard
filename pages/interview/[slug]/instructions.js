import { useRouter } from "next/router";
import { useEffect, useMemo, useState,useRef } from "react";

export default function InstructionsPage() {
  const router = useRouter();
  const { sessionId, slug } = router.query;
useEffect(() => {
  if (slug) {
    localStorage.setItem("currentJobSlug", slug);
  }
}, [slug]);

  /* ================= STATE ================= */
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("aptitude");

  const [aptiAnswers, setAptiAnswers] = useState({});
  const [techAnswers, setTechAnswers] = useState({});
  const [techWrittenAnswers, setTechWrittenAnswers] = useState({});

  const [aptiCompleted, setAptiCompleted] = useState(false);
  const [techCompleted, setTechCompleted] = useState(false);

  const [techTab, setTechTab] = useState("mcq"); // mcq | written

  const [tabViolations, setTabViolations] = useState(null);
  const [tabWarning, setTabWarning] = useState(false);

  /* ================= BUTTON STYLE ================= */
  const primaryBtn =
    "px-6 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition";

  /* ================= TIMERS ================= */
  const SECTION_TIMERS = useMemo(
    () => ({
      aptitude: 300,
      technical: 1800,
    }),
    []
  );
const autoSubmitted = useRef({
  aptitude: false,
  technical: false,
});

  const [sectionStartedAt, setSectionStartedAt] = useState({
    aptitude: null,
    technical: null,
  });

  const [timeLeft, setTimeLeft] = useState(SECTION_TIMERS[activeTab]);

  /* ================= DERIVED ================= */
  const aptiArray = session?.generatedQuestions?.aptitude || [];
  const technicalMcq =
    session?.generatedQuestions?.technical?.mcq || [];
  const technicalWritten =
    session?.generatedQuestions?.technical?.written || [];

  const questionsReady =
    aptiArray.length > 0 &&
    technicalMcq.length > 0 &&
    technicalWritten.length > 0;
 useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, [activeTab]);

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const res = await fetch(`/api/session/${sessionId}`);
      const data = await res.json();
      if (data.ok) setSession(data.session);
    };

    fetchSession();
    const i = setInterval(fetchSession, 3000);
    return () => clearInterval(i);
  }, [sessionId]);

  /* ================= RESTORE ================= */
  useEffect(() => {
    if (!sessionId) return;

    const saved = localStorage.getItem(`assessment_${sessionId}`);
    if (!saved) {
      setSectionStartedAt({ aptitude: null, technical: null });
      return;
    }

    const parsed = JSON.parse(saved);
    setAptiAnswers(parsed.aptiAnswers || {});
    setTechAnswers(parsed.techAnswers || {});
    setTechWrittenAnswers(parsed.techWrittenAnswers || {});
    setTechTab(parsed.techTab || "mcq");
    setActiveTab(parsed.activeTab || "aptitude");
    setAptiCompleted(parsed.aptiCompleted || false);
    setTechCompleted(parsed.techCompleted || false);
    setSectionStartedAt(parsed.sectionStartedAt);
  }, [sessionId]);

  /* ================= SAVE ================= */
  useEffect(() => {
    if (!sessionId) return;

    localStorage.setItem(
      `assessment_${sessionId}`,
      JSON.stringify({
        aptiAnswers,
        techAnswers,
        techWrittenAnswers,
        techTab,
        activeTab,
        aptiCompleted,
        techCompleted,
        sectionStartedAt,
      })
    );
  }, [
    aptiAnswers,
    techAnswers,
    techWrittenAnswers,
    techTab,
    activeTab,
    aptiCompleted,
    techCompleted,
    sectionStartedAt,
  ]);

  /* ================= START TIMER ONLY WHEN QUESTIONS READY ================= */
  useEffect(() => {
    if (
      questionsReady &&
      activeTab === "aptitude" &&
      !sectionStartedAt.aptitude
    ) {
      setSectionStartedAt((s) => ({
        ...s,
        aptitude: Date.now(),
      }));
    }
  }, [questionsReady, activeTab, sectionStartedAt]);

  /* ================= TIMER ================= */
  useEffect(() => {
    const start = sectionStartedAt[activeTab];
    if (!start) return;

    const total = SECTION_TIMERS[activeTab];
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimeLeft(Math.max(total - elapsed, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, sectionStartedAt, SECTION_TIMERS]);

  /* ================= ANTI-CHEAT (REAL ENFORCEMENT) ================= */
  useEffect(() => {
    const block = (e) => e.preventDefault();

    const blockKeys = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    const visibility = () => {
      if (document.hidden) {
        // setTabViolations((v) => {
        //   const next = v + 1;
        //   if (next >= 3) {
        //     finishInterview(); // 🚨 force submit
        //   }
        //   return next;
        // });
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 8000);
      }
    };

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    window.addEventListener("keydown", blockKeys);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      window.removeEventListener("keydown", blockKeys);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
  if (timeLeft > 0) return;

  const start = sectionStartedAt[activeTab];
  if (!start) return;

  if (
    activeTab === "aptitude" &&
    !aptiCompleted &&
    !autoSubmitted.current.aptitude
  ) {
    autoSubmitted.current.aptitude = true;
    submitMCQ();
  }

  if (
    activeTab === "technical" &&
    !techCompleted &&
    !autoSubmitted.current.technical
  ) {
    autoSubmitted.current.technical = true;
    submitTechnical();
  }
}, [timeLeft, activeTab, aptiCompleted, techCompleted, sectionStartedAt]);

  /* ================= HELPERS ================= */
 const formatTime = (s) => {
  if (s === null) return "--:--";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60
  ).padStart(2, "0")}`;
};


  /* ================= SUBMITS ================= */
  async function submitMCQ() {
    await fetch("/api/admin/interviews/submit-mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        section: "apti",
        isComplete: false,
        answers: Object.entries(aptiAnswers).map(([k, v]) => ({
          questionIndex: Number(k),
          selectedOptionIndex: v,
        })),
      }),
    });

    setAptiCompleted(true);
    setActiveTab("technical");
    setSectionStartedAt((s) => ({ ...s, technical: Date.now() }));
setTimeLeft(SECTION_TIMERS.technical); // ✅ IMPORTANT
  }

  async function submitTechnical() {
  await fetch("/api/admin/interviews/submit-mcq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      section: "technical",
      isComplete: true,

      // ✅ MCQ answers (unchanged)
      answers: Object.entries(techAnswers).map(([k, v]) => ({
        questionIndex: Number(k),
        selectedOptionIndex: v,
      })),

      // ✅ WRITTEN answers (THIS WAS MISSING)
      writtenAnswers: Object.entries(techWrittenAnswers).map(([k, v]) => ({
        questionIndex: Number(k),
        response: v, // 🔴 MUST be "response"
      })),
    }),
  });

  setTechCompleted(true);
  finishInterview();
}

  async function finishInterview() {
    localStorage.removeItem(`assessment_${sessionId}`);
    await fetch("/api/admin/interviews/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
   const safeSlug =
  slug || localStorage.getItem("currentJobSlug");

router.push(`/interview/${safeSlug}/thank-you`);

  }

  /* ================= UI ================= */
  if (!session)
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  if (!questionsReady)
    return <div className="min-h-screen flex items-center justify-center">Preparing questions…</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-6xl mx-auto select-none">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Assessment Test</h1>
        <span className="font-mono">{formatTime(timeLeft)}</span>
      </div>

      {tabWarning && (
        <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
          ⚠️ Tab switching detected. Multiple violations will end the interview.
        </div>
      )}

      {/* ===== APTITUDE ===== */}
      {activeTab === "aptitude" && (
        <>
          {aptiArray.map((q, i) => (
            <div key={i} className="mb-4 p-4 bg-white rounded shadow">
              <p className="font-medium mb-2">{i + 1}. {q.prompt}</p>
              {q.options.map((o, oi) => (
                <label key={oi} className="block">
                  <input
                    type="radio"
                    checked={aptiAnswers[i] === oi}
                    onChange={() =>
                      setAptiAnswers({ ...aptiAnswers, [i]: oi })
                    }
                  />{" "}
                  {o}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submitMCQ} className={primaryBtn}>
            Submit Aptitude
          </button>
        </>
      )}

      {/* ===== TECHNICAL ===== */}
      {activeTab === "technical" && (
        <>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setTechTab("mcq")}
              className={`px-4 py-2 rounded ${
                techTab === "mcq" ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              MCQ
            </button>
            <button
              onClick={() => setTechTab("written")}
              className={`px-4 py-2 rounded ${
                techTab === "written" ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              Written
            </button>
          </div>

          {techTab === "mcq" &&
            technicalMcq.map((q, i) => (
              <div key={i} className="mb-4 p-4 bg-white rounded shadow">
                <p className="font-medium mb-2">{i + 1}. {q.prompt}</p>
                {q.options.map((o, oi) => (
                  <label key={oi} className="block">
                    <input
                      type="radio"
                      checked={techAnswers[i] === oi}
                      onChange={() =>
                        setTechAnswers({ ...techAnswers, [i]: oi })
                      }
                    />{" "}
                    {o}
                  </label>
                ))}
              </div>
            ))}

          {techTab === "written" &&
            technicalWritten.map((q, i) => (
              <div key={i} className="mb-4 p-4 bg-white rounded shadow">
                <p className="font-medium">{i + 1}. {q.prompt}</p>
                {q.hint && (
                  <p className="text-sm text-gray-500 mb-2">Hint: {q.hint}</p>
                )}
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  value={techWrittenAnswers[i] || ""}
                  onChange={(e) =>
                    setTechWrittenAnswers({
                      ...techWrittenAnswers,
                      [i]: e.target.value,
                    })
                  }
                />
              </div>
            ))}

          <button onClick={submitTechnical} className={primaryBtn}>
            Finish Technical
          </button>
        </>
      )}
    </div>
  );
}
