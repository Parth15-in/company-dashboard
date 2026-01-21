// pages/admin/report/[sessionId].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Award, TrendingUp, Download, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("candidate");

  useEffect(() => {
    if (!sessionId) return;
    fetchReport();
  }, [sessionId]);

  async function fetchReport() {
    try {
      setLoading(true);
      const res = await fetch(`/api/interviews/generate-report?sessionId=${sessionId}`);
      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        setReport(data.report);
      } else {
        setError(data.error || "Failed to load report");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error fetching report:", err);
      setError("Error loading report");
    }
  }

  function downloadReport() {
    if (!report) return;

    const content = `
================================================================================
                     INTERVIEW ASSESSMENT REPORT
================================================================================

CANDIDATE INFORMATION
─────────────────────────────────────────────────────────────────────────────
Name:           ${report.candidateName}
Email:          ${report.candidateEmail}
Position:       ${report.jobRole}
Assessment Date: ${new Date(report.submittedAt).toLocaleString()}

================================================================================
                          PERFORMANCE SCORES
================================================================================

Overall Score: ${report.scores.overall}/100

DETAILED BREAKDOWN:
┌─────────────────────────────────────────────────────────────────────────┐
│ Aptitude Test                                                           │
│ Score: ${report.scores.aptitude.score}% | Correct: ${report.scores.aptitude.correct}/${report.scores.aptitude.total} | Weight: ${report.scores.aptitude.weight}% │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Technical Assessment                                                    │
│ Score: ${report.scores.technical.score}% | Completed: ${report.scores.technical.completed}/${report.scores.technical.total} | Weight: ${report.scores.technical.weight}% │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
Soft Skills Assessment                                                  │
Score: ${report.scores.softskill.score}% | Completed: ${report.scores.softskill.completed}/${report.scores.softskill.total} | Weight: ${report.scores.softskill.weight}% │


================================================================================
                       ROLE FIT ANALYSIS
================================================================================

THRESHOLD ASSESSMENT:
${report.roleAnalysis.meetsThreshold.aptitude ? "✓" : "✗"} Aptitude Requirement: ${report.roleAnalysis.meetsThreshold.aptitude ? "MET" : "NOT MET"}
${report.roleAnalysis.meetsThreshold.technical ? "✓" : "✗"} Technical Requirement: ${report.roleAnalysis.meetsThreshold.technical ? "MET" : "NOT MET"}
${report.roleAnalysis.meetsThreshold.softskill ? "✓" : "✗"} Soft Skills Requirement: ${report.roleAnalysis.meetsThreshold.softskill ? "MET" : "NOT MET"}

COMPLETION RATES:
• Aptitude: ${report.roleAnalysis.completionRate.aptitude}%
• Technical: ${report.roleAnalysis.completionRate.technical}%
• Soft Skills: ${report.roleAnalysis.completionRate.softskill}%

IDENTIFIED STRENGTHS:
${report.roleAnalysis.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

AREAS FOR DEVELOPMENT:
${report.roleAnalysis.weaknesses.length > 0 
  ? report.roleAnalysis.weaknesses.map((w, i) => `${i + 1}. ${w}`).join("\n")
  : "No significant weaknesses identified"}

================================================================================
                    HIRING RECOMMENDATION
================================================================================

STATUS: ${report.recommendation.status}
CONFIDENCE LEVEL: ${report.recommendation.confidence}%
RATIONALE:
${report.recommendation.reason.map((r) => `• ${r}`).join("\n")}

NEXT STEPS:
${report.recommendation.nextSteps.map((s) => `• ${s}`).join("\n")}

================================================================================
                   DETAILED HR ASSESSMENT
================================================================================

${report.aiReport}

================================================================================
Report Generated: ${new Date().toLocaleString()}
================================================================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${report.candidateName.replace(/\s+/g, "-")}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing candidate performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "STRONG FIT":
        return "bg-green-100 border-green-500 text-green-800";
      case "GOOD FIT":
        return "bg-blue-100 border-blue-500 text-blue-800";
      case "MODERATE FIT":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      default:
        return "bg-red-100 border-red-500 text-red-800";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
                Interview Assessment Report
              </h1>
              <p className="text-gray-600">
                {report.candidateName} • {report.jobRole}
              </p>
            </div>
            <Award className="w-12 h-12 text-blue-600 hidden md:block" />
          </div>
          <p className="text-sm text-gray-500">
            Generated on {new Date(report.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Recommendation Banner */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 border-l-4 ${getStatusColor(report.recommendation.status)}`}>
          <div className="flex items-start gap-4">
            {report.recommendation.status === "STRONG FIT" || report.recommendation.status === "GOOD FIT" ? (
              <CheckCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{report.recommendation.status}</h2>
              <p className="mb-3">Confidence: <span className="font-semibold">{report.recommendation.confidence}%</span></p>
              <div className="mb-3">
                <p className="font-semibold mb-2">Assessment Summary:</p>
                {report.recommendation.reason.map((r, i) => (
                  <p key={i} className="text-sm mb-1">• {r}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold mb-2">Recommended Next Steps:</p>
                {report.recommendation.nextSteps.map((step, i) => (
                  <p key={i} className="text-sm mb-1">→ {step}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-lg mb-2">Overall Performance Score</p>
            <div className="text-7xl font-bold mb-2">{report.scores.overall}</div>
            <p className="text-blue-100">out of 100</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Aptitude */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Aptitude Test</h3>
              <div className={`text-4xl font-bold ${getScoreColor(report.scores.aptitude.score)}`}>
                {report.scores.aptitude.score}%
              </div>
              <p className="text-sm mt-2 text-blue-100">Weight: {report.scores.aptitude.weight}%</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between text-gray-600 text-sm mb-4">
                <span>Correct Answers</span>
                <span className="font-semibold">{report.scores.aptitude.correct}/{report.scores.aptitude.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${report.scores.aptitude.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {report.roleAnalysis.meetsThreshold.aptitude ? "✓ Meets threshold" : "✗ Below threshold"}
              </p>
            </div>
          </div>

          {/* Technical */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Technical Skills</h3>
              <div className={`text-4xl font-bold ${getScoreColor(report.scores.technical.score)}`}>
                {report.scores.technical.score}%
              </div>
              <p className="text-sm mt-2 text-purple-100">Weight: {report.scores.technical.weight}%</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between text-gray-600 text-sm mb-4">
                <span>Completed</span>
                <span className="font-semibold">{report.scores.technical.completed}/{report.scores.technical.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${report.scores.technical.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {report.roleAnalysis.meetsThreshold.technical ? "✓ Meets threshold" : "✗ Below threshold"}
              </p>
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Soft Skills</h3>
              <div className={`text-4xl font-bold ${getScoreColor(report.scores.softskill.score)}`}>
                {report.scores.softskill.score}%
              </div>
              <p className="text-sm mt-2 text-pink-100">Weight: {report.scores.softskill.weight}%</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between text-gray-600 text-sm mb-4">
                <span>Completed</span>
                <span className="font-semibold">{report.scores.softskill.completed}/{report.scores.softskill.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-pink-600 h-3 rounded-full transition-all"
                  style={{ width: `${report.scores.softskill.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {report.roleAnalysis.meetsThreshold.softskill ? "✓ Meets threshold" : "✗ Below threshold"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for Candidate vs Company View */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("candidate")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === "candidate"
                  ? "text-blue-600 bg-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Candidate Feedback
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === "company"
                  ? "text-blue-600 bg-white border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              HR Analysis & Recommendation
            </button>
          </div>

          <div className="p-8">
            {activeTab === "candidate" ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance Summary</h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Strengths</h4>
                  {report.roleAnalysis.strengths.map((strength, i) => (
                    <div key={i} className="flex gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>

                {report.roleAnalysis.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Areas for Development</h4>
                    {report.roleAnalysis.weaknesses.map((weakness, i) => (
                      <div key={i} className="flex gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{weakness}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  HR Assessment & Decision Analysis
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.aiReport}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download Full Report
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}