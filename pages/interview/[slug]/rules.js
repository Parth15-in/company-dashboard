import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RulesPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("candidateForm");
    if (!stored) {
      router.push(`/interview/${slug}/apply`);
      return;
    }
    setCandidate(JSON.parse(stored));
  }, [slug]);

  async function startInterview() {
    setLoading(true);

    const res = await fetch("/api/admin/interviews/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        candidate
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      localStorage.setItem("candidateEmail", candidate.email);
      localStorage.removeItem("candidateForm");
      router.push(data.instructionsUrl);
    } else {
      alert(data.detail || "Unable to start interview");
    }
  }

  return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
  <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">

    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        Interview Instructions
      </h1>
      <p className="mt-2 text-sm sm:text-base text-gray-600">
        Please review the following guidelines carefully before starting your interview.
      </p>
    </div>

    {/* Interview Structure */}
    <div className="mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Interview Structure
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Aptitude */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="text-sm font-semibold text-gray-900">
            Aptitude Assessment
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Multiple Choice Questions (MCQ)
          </div>
          <div className="mt-3 text-sm font-medium text-blue-600">
            Duration: 5 minutes
          </div>
        </div>

        {/* Technical */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="text-sm font-semibold text-gray-900">
            Technical Interview
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Multiple Choice Questions (MCQ) and Written Questions
          </div>
          <div className="mt-3 text-sm font-medium text-blue-600">
            Duration: 30 minutes
          </div>
        </div>

        {/* Soft Skills */}
        {/* <div className="border rounded-xl p-4 bg-gray-50">
          <div className="text-sm font-semibold text-gray-900">
            Soft Skills Evaluation
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Voice-based responses
          </div>
          <div className="mt-3 text-sm font-medium text-blue-600">
            Duration: 30 minutes
          </div>
        </div> */}
      </div>
    </div>

    {/* Instructions */}
    <div className="space-y-5 mb-8">
      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
        <p className="text-sm sm:text-base text-gray-700">
          Once the interview begins, switching browser tabs, opening new windows,
          or navigating away from the interview screen is not permitted and may be recorded.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
        <p className="text-sm sm:text-base text-gray-700">
          Ensure you have a stable internet connection and are seated in a quiet
          environment before starting the interview.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
        <p className="text-sm sm:text-base text-gray-700">
          Each section is time-limited. When the allotted time expires,
          the system will automatically proceed to the next section.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
        <p className="text-sm sm:text-base text-gray-700">
          Refreshing or closing the browser after the interview has started
          may result in automatic submission of your responses.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
        <p className="text-sm sm:text-base text-gray-700">
          The interview will be automatically submitted once the total
          interview duration is completed.
        </p>
      </div>
    </div>

    {/* Start Button */}
    <div className="flex justify-center">
      <button
        onClick={startInterview}
        disabled={loading}
        className={`w-full sm:w-auto px-10 py-3 rounded-lg font-medium text-white transition
          ${loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
          }`}
      >
        {loading ? "Starting Interview..." : "Start Interview"}
      </button>
    </div>

  </div>
</div>

  );
}
