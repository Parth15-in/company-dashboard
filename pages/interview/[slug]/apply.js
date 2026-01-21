// // pages/interview/[slug]/apply.js
// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";

// export default function ApplyPage() {
//   const router = useRouter();
//   const { slug } = router.query;
//   const [form, setForm] = useState({ name: "", email: "", phone: "" });
//   const [loading, setLoading] = useState(false);
//   const [jobInfo, setJobInfo] = useState(null);

//   useEffect(() => {
//     if (!slug) return;
//     // Optionally fetch job info for display
//     const fetchJob = async () => {
//       try {
//         const res = await fetch(`/api/job-by-slug/${slug}`);
//         if (res.ok) {
//           const j = await res.json();
//           if (j.ok) setJobInfo(j.job);
//         }
//       } catch (e) {}
//     };
//     fetchJob();
//   }, [slug]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setLoading(true);
//     const res = await fetch("/api/admin/interviews/start", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ slug, candidate: form }),
//     });
//     const data = await res.json();
//     setLoading(false);
//     if (data.ok) {
//       router.push(data.instructionsUrl);
//     } else {
//       alert("Error starting interview: " + (data.detail || "unknown"));
//     }
//   }

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">{jobInfo ? `Apply: ${jobInfo.jobRole}` : "Apply for Interview"}</h1>

//       {jobInfo && <div className="mb-4 p-3 bg-gray-50 rounded">
//         <div className="font-semibold">{jobInfo.jobRole}</div>
//         <div className="text-sm text-gray-700 mt-1">{jobInfo.jd}</div>
//       </div>}

//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2" />
//         <input required placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full border p-2" />
//         <input required placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="w-full border p-2" />
//         <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Starting..." : "Start Interview"}</button>
//       </form>
//     </div>
//   );
// }



// pages/interview/[slug]/apply.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function ApplyPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/job-by-slug/${slug}`);
        if (res.ok) {
          const j = await res.json();
          if (j.ok) setJobInfo(j.job);
        }
      } catch (e) {}
    };
    fetchJob();
  }, [slug]);

  // ------------------------------
  // VALIDATION FUNCTION
  // ------------------------------
  const validate = () => {
    let errs = {};

    if (!form.name.trim()) errs.name = "Name is required";

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      errs.phone = "Phone must be 10 digits only";
    }

    return errs;
  };

  // ------------------------------
  // SUBMIT HANDLER
  // ------------------------------
  // async function handleSubmit(e) {
  //   e.preventDefault();

  //   const v = validate();
  //   if (Object.keys(v).length > 0) {
  //     setErrors(v);
  //     return;
  //   }

  //   setErrors({});
  //   setLoading(true);

  //   const res = await fetch("/api/admin/interviews/start", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ slug, candidate: form }),
  //   });

  //   const data = await res.json();
  //   setLoading(false);

  //   if (data.ok) {
  //     localStorage.setItem("candidateEmail", form.email);
  //     router.push(data.instructionsUrl);
  //   } else {
  //     alert("Error starting interview: " + (data.detail || "unknown"));
  //   }
  // }
async function handleSubmit(e) {
  e.preventDefault();

  const v = validate();
  if (Object.keys(v).length > 0) {
    setErrors(v);
    return;
  }

  // store candidate temporarily
  localStorage.setItem("candidateForm", JSON.stringify(form));

  // go to rules page
  router.push(`/interview/${slug}/rules`);
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-8">

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {jobInfo ? `Apply: ${jobInfo.jobRole}` : "Apply for Interview"}
        </h1>

        {/* Job Info */}
        {jobInfo && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg border">
            <div className="font-semibold text-gray-800">{jobInfo.jobRole}</div>
            <div className="text-sm text-gray-600 mt-2">{jobInfo.jd}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
                ${errors.name ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
                ${errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 
                ${errors.phone ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg font-semibold shadow 
              ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Next" : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
}
