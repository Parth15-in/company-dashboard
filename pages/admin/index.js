// pages/admin/index.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
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
    

    const { aptitude, technical,  totalQuestions } = form.questions;
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

            <div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <MdLogout size={18} />
                {/* {loggingOut ? "Logging out..." : "Logout"} */}
              </button>
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
        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl relative flex flex-col max-h-[90vh]">
              <button onClick={() => setShowCreate(false)} className="absolute right-4 top-4 text-gray-600">✕</button>
              <h3 className="text-xl font-semibold mb-4">Create Interview</h3>

              <form
                onSubmit={handleCreate}
                className="p-6 overflow-y-auto space-y-4 flex-1"
              >

                <div>
                  <label className="text-sm font-medium">Job Role</label>
                  <input value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  {errors.jobRole && <div className="text-xs text-red-600 mt-1">{errors.jobRole}</div>}
                </div>

                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <textarea value={form.jd} onChange={(e) => setForm({ ...form, jd: e.target.value })} rows={4} className="mt-1 block w-full border rounded p-2" />
                  {errors.jd && <div className="text-xs text-red-600 mt-1">{errors.jd}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium">Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="mt-1 block w-full border rounded p-2"
                  />
                  {errors.qualification && <div className="text-xs text-red-600 mt-1">{errors.qualification}</div>}
                </div>

                <div>
                  <label className="text-sm font-medium">Criteria</label>
                  <input
                    value={form.criteria}
                    onChange={(e) => setForm({ ...form, criteria: e.target.value })}
                    className="mt-1 block w-full border rounded p-2"
                  />
                  {errors.criteria && <div className="text-xs text-red-600 mt-1">{errors.criteria}</div>}
                </div>
               

                  

                  

                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="mt-1 block w-full border rounded p-2"
                      placeholder="Bangalore, Pune, Noida"
                    />
                    {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
                  </div>

                 

                
                


                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">Aptitude</label>
                    <input type="number" value={form.questions.aptitude} onChange={(e) => setForm({ ...form, questions: { ...form.questions, aptitude: Number(e.target.value) } })} className="mt-1 block w-full border rounded p-2" />
                    {errors.aptitude && <div className="text-xs text-red-600 mt-1">{errors.aptitude}</div>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Technical</label>
                    <input type="number" value={form.questions.technical} onChange={(e) => setForm({ ...form, questions: { ...form.questions, technical: Number(e.target.value) } })} className="mt-1 block w-full border rounded p-2" />
                    {errors.technical && <div className="text-xs text-red-600 mt-1">{errors.technical}</div>}
                  </div>
                  {/* <div>
                    <label className="text-sm font-medium">Softskill</label>
                    <input type="number" value={form.questions.softskill} onChange={(e) => setForm({ ...form, questions: { ...form.questions, softskill: Number(e.target.value) } })} className="mt-1 block w-full border rounded p-2" />
                    {errors.softskill && <div className="text-xs text-red-600 mt-1">{errors.softskill}</div>}
                  </div> */}
                </div>

                {errors.total && <div className="text-sm text-red-700">{errors.total}</div>}

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                      className={`h-full rounded-full ${
                        value >= 7
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
              selectedReport.shortlisted = newStatus;
              setShowReportModal(false);
              loadReports();
            }
          }}
          className={`px-4 py-2 rounded-md text-white font-medium
            ${selectedReport.shortlisted ? "bg-red-600" : "bg-green-600"}
          `}
        >
          {selectedReport.shortlisted
            ? "Remove from Shortlist"
            : "Shortlist Candidate"}
        </button>

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


      </div>
    </div>
  );
}
