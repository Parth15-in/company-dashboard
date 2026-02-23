// pages/admin/index.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import CompanyProfileModal from "../../components/CompanyProfileModal";
import { FiUser } from "react-icons/fi";
import jsPDF from "jspdf";
export default function AdminIndex() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // interviews
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // reports
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("interviews"); // interviews | reports
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [recommendFilter, setRecommendFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    jobRole: "",
    jd: "",
    qualification: "",
    criteria: "",
    location: "",
    questions: {
      totalQuestions: 60,
      aptitude: 30,
      technical: 30,

    },
  });


  // report modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
const [showProfileMenu, setShowProfileMenu] = useState(false);
 const [selectedInterviewReport, setSelectedInterviewReport] = useState(null);
  const [showInterviewReportModal, setShowInterviewReportModal] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      await loadInterviews();
      await loadReports();
    })();
  }, []);

  async function loadInterviews() {
    console.log("typeof fetch =", typeof fetch);
    console.log("fetch value =", fetch);
    try {
      setLoadingInterviews(true);
      const res = await window.fetch("/api/admin/interviews", {
        credentials: "include",
      });

      const data = await res.json();
      if (data.ok) setInterviews(data.interviews || []);
    } catch (err) {
      console.error("fetchList error", err);
    } finally {
      setLoadingInterviews(false);
    }
  }

  async function loadReports() {
    try {
      setLoadingReports(true);
      const res = await window.fetch("/api/admin/reports", {
        credentials: "include",
      });

      const data = await res.json();
      if (data.ok) setReports(data.reports || []);
    } catch (err) {
      console.error("loadReports error", err);
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const res = await window.fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/admin/login");
      }
    } catch (err) {
      console.error("logout error", err);
      setLoggingOut(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    const v = validateForm();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      const payload = {
        ...form,
        clients: form.clients
          ? form.clients.split(",").map(c => c.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      console.log("CREATE RESPONSE:", data);

      if (data.ok) {
        loadInterviews();
        setShowCreate(false);
        alert("Job created successfully");
      } else {
        alert("Error creating interview");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating interview");
    }
  }

  function validateForm() {
    let err = {};
    if (!form.jobRole.trim()) err.jobRole = "Job role is required";
    if (!form.jd.trim()) err.jd = "Job description is required";
    if (!form.qualification.trim()) err.qualification = "Qualification is required";
    if (!form.criteria.trim()) err.criteria = "Criteria is required";
    if (!form.location.trim()) err.location = "Location is required";


    const { aptitude, technical, totalQuestions } = form.questions;
    if (aptitude < 1) err.aptitude = "Must be at least 1";
    if (technical < 1) err.technical = "Must be at least 1";


    const sum = aptitude + technical;
    if (sum !== totalQuestions) err.total = `Total must be ${totalQuestions}, but got ${sum}`;
    return err;
  }

  async function toggleActive(id, current) {
    try {
      await fetch(`/api/admin/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      loadInterviews();
    } catch (err) {
      console.error("toggleActive error", err);
    }
  }

  function openReportModal(report) {
    setSelectedReport(report);
    setShowReportModal(true);
  }
  function closeReportModal() {
    setSelectedReport(null);
    setShowReportModal(false);
  }

  // Derived lists + filtering
  const roles = useMemo(() => {
    const set = new Set();
    interviews.forEach(i => i.jobRole && set.add(i.jobRole));
    reports.forEach(r => r.role && set.add(r.role));
    return ["all", ...Array.from(set)];
  }, [interviews, reports]);

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter(r => {
      if (roleFilter !== "all" && (r.role || "Unknown") !== roleFilter) return false;
      if (recommendFilter !== "all") {
        const rec = (r.reportAnalysis?.recommendation || "Report Pending");
        if (rec !== recommendFilter) return false;
      }
      if (statusFilter !== "all") {
        const status = r.reportAnalysis ? "done" : "pending";
        if (status !== statusFilter) return false;
      }
      if (!q) return true;
      return (r.email || "").toLowerCase().includes(q) || (r.role || "").toLowerCase().includes(q);
    });
  }, [reports, search, roleFilter, recommendFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const pageItems = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = (list) => {
    if (!list.length) return;
    const header = ["Email", "Role", "Recommendation", "Answered", "Total", "Date"];
    const rows = list.map(r => {
      const rec = r.reportAnalysis?.recommendation || "Report Pending";
      return [
        r.email || "",
        r.role || "",
        rec,
        r.reportAnalysis?.answeredCount || 0,
        r.reportAnalysis?.totalQuestions || 0,
        new Date(r.createdAt).toLocaleString()
      ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadReportPDF = (report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    };

    // Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Candidate Report", margin, 25);

    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Candidate Info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Candidate Information", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Email: ${report.email || "N/A"}`, margin, yPos);
    yPos += 7;
    doc.text(`Role: ${report.role || "N/A"}`, margin, yPos);
    yPos += 7;
    doc.text(`Date: ${new Date(report.createdAt).toLocaleString()}`, margin, yPos);
    yPos += 15;

    // Recommendation Badge
    const recommendation = report.reportAnalysis?.recommendation || "Pending";
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendation:", margin, yPos);

    // Set color based on recommendation
    if (recommendation === "Proceed") {
      doc.setTextColor(22, 163, 74); // Green
    } else if (recommendation === "Borderline") {
      doc.setTextColor(234, 179, 8); // Yellow
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(recommendation, margin + 50, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Role Fit
    if (report.reportAnalysis?.roleFit) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Role Fit", margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const roleFitText = `${report.reportAnalysis.roleFit.match} - ${report.reportAnalysis.roleFit.explanation}`;
      yPos = addText(roleFitText, margin, yPos, pageWidth - 2 * margin);
      yPos += 10;
    }

    // Scores
    if (report.reportAnalysis?.scores) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Scorecard", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      Object.entries(report.reportAnalysis.scores).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        doc.text(`${label}: ${value}/10`, margin, yPos);
        yPos += 7;
      });

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text(`Overall Score: ${report.reportAnalysis.overallScore || 0} / 60`, margin, yPos);
      yPos += 15;
    }

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Evaluation Text
    if (report.reportAnalysis?.evaluationText) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Evaluation", margin, yPos);
      yPos += 10;

      Object.entries(report.reportAnalysis.evaluationText).forEach(([key, value]) => {
        if (key !== "overallSummary") {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const sectionTitle = key.replace(/([A-Z])/g, ' $1').trim();
          doc.text(sectionTitle, margin, yPos);
          yPos += 7;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          yPos = addText(value, margin, yPos, pageWidth - 2 * margin);
          yPos += 10;
        }
      });
    }

    // Overall Summary
    if (report.reportAnalysis?.evaluationText?.overallSummary) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFillColor(219, 234, 254); // Light blue
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 10, 'F');

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Overall Assessment Summary", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      yPos = addText(report.reportAnalysis.evaluationText.overallSummary, margin, yPos, pageWidth - 2 * margin);
      yPos += 10;
    }

    // Improvement Resources
    if (report.reportAnalysis?.improvementResources) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Recommended Improvement Areas", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const allResources = Object.values(report.reportAnalysis.improvementResources).flat();
      allResources.forEach((item, idx) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        yPos = addText(`• ${item}`, margin, yPos, pageWidth - 2 * margin);
        yPos += 5;
      });
    }

    // Footer
    const totalPagesExp = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesExp; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPagesExp}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `${report.email?.replace(/[^a-z0-9]/gi, '_')}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };
  
  const downloadInterviewPDF = (report) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    doc.setFontSize(18);
    doc.text("Interview Evaluation Report", margin, y);
    y += 15;

    doc.setFontSize(11);
    doc.text(`Email: ${report.email}`, margin, y);
    y += 8;
    doc.text(`Role: ${report.role}`, margin, y);
    y += 15;

    const lines = doc.splitTextToSize(
      report.reportAnalysis || "",
      pageWidth - margin * 2
    );

    doc.text(lines, margin, y);

    doc.save(
      `${report.email.replace(/[^a-z0-9]/gi, "_")}_interview_report.pdf`
    );
  };
  async function openInterviewReport(email, role) {
    try {
      const res = await fetch(
        `/api/admin/interview-reports?email=${email}&role=${role}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.ok && data.report) {
        setSelectedInterviewReport(data.report);
        setShowInterviewReportModal(true);
      } else {
        alert("Interview report not found");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading interview report");
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Company Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage interviews, view AI reports and shortlist candidates.</p>
          </div>

          <div className="flex items-center gap-3">

            <div>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
              >
                + Create Interview
              </button>
            </div>

{/* Profile Dropdown */}
<div className="relative">
  <button
    onClick={() => setShowProfileMenu(p => !p)}
    className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center border border-black"
  >
    <FiUser size={18} />
  </button>

  {showProfileMenu && (
    <>
      {/* click outside overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowProfileMenu(false)}
      />

      {/* dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-50">
        <button
          onClick={() => {
            setShowCompanyProfile(true);
            setShowProfileMenu(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Profile
        </button>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </>
  )}
</div>

          </div>
        </div>

        {/* tabs + filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setActiveTab("interviews")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "interviews" ? "bg-white text-gray-900 shadow" : "text-gray-600"}`}
                >
                  Interviews
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "reports" ? "bg-white text-gray-900 shadow" : "text-gray-600"}`}
                >
                  Reports
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search email or role"
                  className="px-3 py-2 border rounded-md text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                  {roles.map(r => <option key={r} value={r}>{r === "all" ? "All roles" : r}</option>)}
                </select>
                <select value={recommendFilter} onChange={(e) => setRecommendFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                  <option value="all">Any recommendation</option>
                  <option value="Proceed">Proceed</option>
                  <option value="Borderline">Borderline</option>
                  <option value="Cannot Proceed">Cannot Proceed</option>
                </select>

              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Showing <span className="font-medium">{filteredReports.length}</span> reports</div>

            </div>
          </div>

          {/* responsive small controls */}
          <div className="mt-3 sm:hidden flex gap-2">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search email or role"
              className="px-3 py-2 border rounded-md text-sm w-full"
            />
          </div>
        </div>

        {/* content */}
        <div >
          <div>
            {/* ⭐ SHOW INTERVIEWS ONLY IF TAB = interviews */}
            {activeTab === "interviews" && (
              <div className="lg:col-span-7">

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Interviews</h3>
                    <div className="text-sm text-gray-500">{loadingInterviews ? "Loading..." : `${interviews.length} created`}</div>
                  </div>

                  {/* responsive cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviews.map(iv => (
                      <div key={iv._id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="">
                          <div>
                            <div className="flex items-center justify-between mt-3 gap-3">

                              {/* Left: Status Badge */}
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${iv.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                {iv.isActive ? "Active" : "Inactive"}
                              </div>

                              {/* Right: Toggle Button */}
                              <button
                                onClick={() => toggleActive(iv._id, iv.isActive)}
                                className="text-sm px-3 py-1 bg-yellow-200 rounded"
                              >
                                Toggle
                              </button>

                            </div>
                            <div className="text-base font-semibold text-gray-900">{iv.jobRole || "Untitled Role"}</div>
                            <div className="text-sm text-gray-500 mt-1">{iv.jd ? iv.jd.slice(0, 300) + (iv.jd.length > 300 ? "…" : "") : "No job description"}</div>
                            <div className="text-sm text-gray-500 mt-1">Qualification: {iv.qualification}</div>
                            <div className="text-sm text-gray-500 mt-1">Criteria: {iv.criteria}</div>
                            <div className="text-sm text-gray-500 mt-1">Location: {iv.location}</div>
                            <div className="mt-2 text-xs text-gray-400">{new Date(iv.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="">

                            <div className="mt-3 flex flex-col gap-2">
                              <a
                                href={`/interview/${iv.slug}/apply`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 text-sm underline break-all"
                              >
                                /interview/{iv.slug}/apply
                              </a>


                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* fallback */}
                  {interviews.length === 0 && !loadingInterviews && (
                    <div className="text-center text-gray-500 p-8">No interviews created yet.</div>
                  )}
                </div>
              </div>
            )}


            {/* ⭐ SHOW REPORTS ONLY IF TAB = reports */}
            {activeTab === "reports" && (
              <div className="lg:col-span-5">

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Candidate Reports</h3>
                    <div className="text-sm text-gray-500">{loadingReports ? "Loading..." : `${reports.length} total`}</div>
                  </div>

                  {/* small summary badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm">Proceed: {reports.filter(r => r.reportAnalysis?.recommendation === "Proceed").length}</div>
                    <div className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm">Borderline: {reports.filter(r => r.reportAnalysis?.recommendation === "Borderline").length}</div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Pending: {reports.filter(r => !r.reportAnalysis).length}</div>
                  </div>

                  {/* reports table (responsive) */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">Role</th>
                          <th className="py-2 pr-4">Recommendation</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-400">No reports match your filters</td>
                          </tr>
                        )}
                        {pageItems.map(r => (
                          <tr key={r._id} className="border-t">
                            <td className="py-3 pr-4">{r.email}</td>
                            <td className="py-3 pr-4">{r.role}</td>
                            <td className="py-3 pr-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${r.reportAnalysis?.recommendation === "Proceed" ? "bg-green-50 text-green-700" : r.reportAnalysis?.recommendation === "Borderline" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-800"}`}>
                                {r.reportAnalysis?.recommendation || "Pending"}
                              </span>
                            </td>
                            <td className="py-3 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
                            <td className="py-3 pr-4">
                              <div className="flex gap-2">
                                <button onClick={() => openReportModal(r)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">View</button>
 <button
                                  onClick={() => openInterviewReport(r.email, r.role)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                                >
                                  Interview
                                </button>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              {r.shortlisted && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <IoMdCheckmarkCircleOutline className="text-sm" />
                                  Shortlisted
                                </span>

                              )
                              }
                            </td>


                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* pagination */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-white border rounded">Prev</button>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-white border rounded">Next</button>
                    </div>
                  </div>
                </div>
              </div>

            )}
          </div>
        </div>
        <CompanyProfileModal
  open={showCompanyProfile}
  onClose={() => setShowCompanyProfile(false)}
/>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
  <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">

    {/* Header */}
    <div className="flex items-center justify-between border-b px-6 py-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Create Interview
      </h3>

      <button
        onClick={() => setShowCreate(false)}
        className="text-gray-500 hover:text-gray-700 text-lg"
      >
        ✕
      </button>
    </div>

    {/* Form */}
    <form
      onSubmit={handleCreate}
      className="p-6 overflow-y-auto space-y-5 flex-1"
    >

      {/* Job Role */}
      <div>
        <label className="text-sm font-medium text-gray-700">Job Role</label>
        <input
          value={form.jobRole}
          onChange={(e) =>
            setForm({ ...form, jobRole: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        {errors.jobRole && (
          <div className="text-xs text-red-600 mt-1">
            {errors.jobRole}
          </div>
        )}
      </div>

      {/* Job Description */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          value={form.jd}
          onChange={(e) =>
            setForm({ ...form, jd: e.target.value })
          }
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        {errors.jd && (
          <div className="text-xs text-red-600 mt-1">
            {errors.jd}
          </div>
        )}
      </div>

      {/* Qualification */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Qualification
        </label>
        <input
          value={form.qualification}
          onChange={(e) =>
            setForm({ ...form, qualification: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        {errors.qualification && (
          <div className="text-xs text-red-600 mt-1">
            {errors.qualification}
          </div>
        )}
      </div>

      {/* Criteria */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Criteria
        </label>
        <input
          value={form.criteria}
          onChange={(e) =>
            setForm({ ...form, criteria: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        {errors.criteria && (
          <div className="text-xs text-red-600 mt-1">
            {errors.criteria}
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="Bangalore, Pune, Noida"
        />
        {errors.location && (
          <p className="text-xs text-red-600 mt-1">
            {errors.location}
          </p>
        )}
      </div>

      {/* Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Aptitude
          </label>
          <input
            type="number"
            value={form.questions.aptitude}
            onChange={(e) =>
              setForm({
                ...form,
                questions: {
                  ...form.questions,
                  aptitude: Number(e.target.value),
                },
              })
            }
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          {errors.aptitude && (
            <div className="text-xs text-red-600 mt-1">
              {errors.aptitude}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Technical
          </label>
          <input
            type="number"
            value={form.questions.technical}
            onChange={(e) =>
              setForm({
                ...form,
                questions: {
                  ...form.questions,
                  technical: Number(e.target.value),
                },
              })
            }
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          {errors.technical && (
            <div className="text-xs text-red-600 mt-1">
              {errors.technical}
            </div>
          )}
        </div>
      </div>

      {errors.total && (
        <div className="text-sm text-red-700">
          {errors.total}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowCreate(false)}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow"
        >
          Create Interview
        </button>
      </div>
    </form>
  </div>
</div>)}

        {/* Report Modal */}
        {/* ===========================
     BEAUTIFUL REPORT MODAL
    =========================== */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl p-6 overflow-auto max-h-[90vh] relative">

              {/* Close */}
              <button
                onClick={closeReportModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

              {/* ================= HEADER ================= */}
              <div className="border-b pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedReport.email}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedReport.role}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Report generated on{" "}
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Recommendation Badge */}
                <div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold
              ${selectedReport.reportAnalysis?.recommendation === "Proceed"
                        ? "bg-green-100 text-green-700"
                        : selectedReport.reportAnalysis?.recommendation === "Borderline"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"}
            `}
                  >
                    {selectedReport.reportAnalysis?.recommendation}
                  </span>
                </div>
              </div>

              {/* ================= HIRING VERDICT ================= */}
              <div className="mt-6 p-5 rounded-lg border bg-gray-50">

                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Role Fit:</strong>{" "}
                  {selectedReport.reportAnalysis?.roleFit?.match} —{" "}
                  {selectedReport.reportAnalysis?.roleFit?.explanation}
                </p>
              </div>

              {/* ================= SCORECARD ================= */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Candidate Scorecard
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedReport.reportAnalysis?.scores || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="p-4 rounded-lg border bg-white shadow-sm"
                      >
                        <div className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-2xl font-bold text-gray-900">
                            {value}/10
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${value >= 7
                                  ? "bg-green-500"
                                  : value >= 4
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              style={{ width: `${(value / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  Overall Score:{" "}
                  <strong>
                    {selectedReport.reportAnalysis?.overallScore} / 60
                  </strong>
                </p>
              </div>

              {/* ================= DETAILED EVALUATION ================= */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Section-wise Evaluation
                </h3>

                <div className="space-y-4">
                  {Object.entries(
                    selectedReport.reportAnalysis?.evaluationText || {}
                  ).map(
                    ([key, value]) =>
                      key !== "overallSummary" && (
                        <div
                          key={key}
                          className="p-4 border rounded-lg bg-white shadow-sm"
                        >
                          <div className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </div>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {value}
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* ================= OVERALL SUMMARY ================= */}
              <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">
                  Overall Assessment Summary
                </h3>
                <p className="text-sm text-blue-900 mt-2 leading-relaxed">
                  {selectedReport.reportAnalysis?.evaluationText?.overallSummary}
                </p>
              </div>

              {/* ================= IMPROVEMENT PLAN ================= */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Recommended Improvement Areas
                </h3>

                <div className="p-4 border bg-gray-50 rounded-lg">
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-2">
                    {Object.values(
                      selectedReport.reportAnalysis?.improvementResources || {}
                    )
                      .flat()
                      .map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="flex justify-between items-center mt-8">
                
                <div className="flex gap-3">

                  {/* Download PDF */}
                  <button
                    onClick={() => downloadReportPDF(selectedReport)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
                  >
                    Download PDF
                  </button>

                  {/* Shortlist Toggle */}
                  <button
                    onClick={async () => {
                      const newStatus = !selectedReport.shortlisted;

                      const res = await fetch(
                        `/api/admin/reports/${selectedReport._id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ shortlisted: newStatus }),
                        }
                      );

                      const data = await res.json();
                      if (data.ok) {
                        setShowReportModal(false);
                        loadReports();
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-white font-medium
      ${selectedReport.shortlisted ? "bg-red-600" : "bg-green-600"}`}
                  >
                    {selectedReport.shortlisted
                      ? "Remove from Shortlist"
                      : "Shortlist Candidate"}
                  </button>

                </div>
                <button
                  onClick={closeReportModal}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
{showInterviewReportModal && selectedInterviewReport && (() => {

          const text = selectedInterviewReport.reportAnalysis || "";

          /* =========================================================
             1️⃣ SCORE EXTRACTION (Robust & Flexible)
             Handles:
             - Technical Proficiency: 6/10
             - Decision-Making: 7/10
             - Decision Making: 7/10
             - With spaces / hyphen variations
          ========================================================= */

          const scoreRegex =
            /(Technical\s*Proficiency|Communication|Decision[-\s]*Making|Confidence|Language\s*Fluency)\s*:\s*(\d+)\s*\/\s*10/gi;

          const scores = [];
          let match;

          while ((match = scoreRegex.exec(text)) !== null) {
            scores.push({
              label: match[1].replace(/\s+/g, " ").trim(),
              value: Number(match[2])
            });
          }

          /* =========================================================
             2️⃣ OVERALL SCORE EXTRACTION
             Handles:
             - Overall: 25/50
             - Overall Score: 25/50
          ========================================================= */

          const overallRegex = /Overall(?:\s*Score)?\s*:\s*(\d+)\s*\/\s*(\d+)/i;
          const overallMatch = text.match(overallRegex);

          const overallScore = overallMatch ? Number(overallMatch[1]) : null;
          const overallTotal = overallMatch ? Number(overallMatch[2]) : null;

          /* =========================================================
             3️⃣ IMPROVEMENT SUGGESTIONS EXTRACTION
             Handles everything after:
             "Improvement Suggestions:"
          ========================================================= */

          const improvementRegex =
            /Improvement\s*Suggestions\s*:\s*([\s\S]*)/i;

          const improvementMatch = text.match(improvementRegex);

          const improvementText = improvementMatch
            ? improvementMatch[1].trim()
            : null;

          /* =========================================================
             4️⃣ MAIN ANALYSIS TEXT (Remove improvements section)
          ========================================================= */

          const mainText = improvementMatch
            ? text.replace(improvementRegex, "").trim()
            : text;

          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-8 overflow-auto max-h-[90vh] relative">

                {/* Close */}
                <button
                  onClick={() => setShowInterviewReportModal(false)}
                  className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>

                {/* Header */}
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Interview Evaluation Report
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Email:</strong> {selectedInterviewReport.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Role:</strong> {selectedInterviewReport.role}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Generated on {new Date(selectedInterviewReport.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* SCORE CARDS */}
                {scores.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Scorecard
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {scores.map((s, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border bg-white shadow-sm"
                        >
                          <div className="text-sm font-medium text-gray-600">
                            {s.label}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-2xl font-bold text-gray-900">
                              {s.value}/10
                            </div>

                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full rounded-full ${s.value >= 7
                                  ? "bg-green-500"
                                  : s.value >= 4
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                  }`}
                                style={{ width: `${(s.value / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {overallScore && (
                      <p className="text-sm text-gray-600 mt-4">
                        <strong>Overall Score:</strong> {overallScore} / {overallTotal}
                      </p>
                    )}
                  </div>
                )}

                {/* MAIN ANALYSIS TEXT */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Detailed Evaluation
                  </h3>

                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border rounded-lg p-4 bg-gray-50">
                    {mainText}
                  </div>
                </div>

                {/* IMPROVEMENTS */}
                {improvementText && (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Improvement Suggestions
                    </h3>

                    <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                      {improvementText}
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-8 gap-3">

                  <button
                    onClick={() => downloadInterviewPDF(selectedInterviewReport)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
                  >
                    Download PDF
                  </button>

                  <button
                    onClick={() => setShowInterviewReportModal(false)}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>
          );

        })()}


      </div>
    </div>
  );
}
