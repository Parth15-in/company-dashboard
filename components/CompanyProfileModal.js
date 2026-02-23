// import { useEffect, useState } from "react";

// export default function CompanyProfileModal({ open, onClose }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     if (typeof window === "undefined") return;

//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         const companyId = localStorage.getItem("companyId");

//         if (!companyId) {
//           alert("Company not found");
//           return;
//         }

//         const res = await fetch(
//           `/api/admin/company/profile?companyId=${companyId}`,
//           { credentials: "include" }
//         );

//         const data = await res.json();
//         if (!data.ok) {
//           alert(data.message || "Failed to load profile");
//           return;
//         }

//         setProfile(data.profile);
//       } catch (err) {
//         alert("Error loading company profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [open]);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex">
//       {/* backdrop */}
//       <div
//         className="flex-1 bg-black/30"
//         onClick={onClose}
//       />

//       {/* drawer */}
//       <div className="w-full sm:w-[420px] bg-white h-full shadow-xl p-6 overflow-y-auto animate-slide-in">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold">Company Profile</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-800 text-xl"
//           >
//             ✕
//           </button>
//         </div>

//         {loading && (
//           <p className="text-sm text-gray-500">Loading...</p>
//         )}

//         {!loading && profile && (
//           <div className="space-y-3 text-sm">
//             <Profile label="Company Name" value={profile.companyName} />
//             <Profile label="Industry" value={profile.industry} />
//             <Profile label="Website" value={profile.website} />
//             <Profile label="Company Type" value={profile.companyType} />
//             <Profile label="Location" value={profile.location} />
//             <Profile label="Employee Size" value={profile.employeeSize} />
//             <Profile label="Hierarchy Level" value={profile.hierarchyLevel} />
//             <Profile label="Communication Style" value={profile.communicationStyle} />
//             <Profile label="Feedback Culture" value={profile.feedbackCulture} />
//             <Profile label="Target Market" value={profile.targetMarket} />
//             <Profile label="Work Pressure" value={profile.workPressure} />

//             <div>
//               <div className="text-gray-500">Sample Clients</div>
//               <div className="font-medium">
//                 {profile.sampleClients?.join(", ") || "—"}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function Profile({ label, value }) {
//   return (
//     <div>
//       <div className="text-gray-500">{label}</div>
//       <div className="font-medium text-gray-900">
//         {value || "—"}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

export default function CompanyProfileModal({ open, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const companyId = localStorage.getItem("companyId");

        if (!companyId) {
          alert("Company not found");
          return;
        }

        const res = await fetch(
          `/api/admin/company/profile?companyId=${companyId}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!data.ok) {
          alert(data.message || "Failed to load profile");
          return;
        }

        setProfile(data.profile);
      } catch (err) {
        console.error(err);
        alert("Error loading company profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* drawer */}
      <div className="w-full sm:w-[480px] bg-white h-full shadow-xl p-6 overflow-y-auto animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Company Culture Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {loading && (
          <p className="text-sm text-gray-500">Loading...</p>
        )}

        {!loading && profile && (
          <div className="space-y-6 text-sm">

            {/* ================= BASIC INFO ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Basic Information
              </h3>
              <Profile label="Company Name" value={profile.basicInfo?.name} />
              <Profile label="Industry" value={profile.basicInfo?.industry} />
              <Profile label="Location" value={profile.basicInfo?.location} />
              <Profile label="Company Type" value={profile.basicInfo?.companyType} />
              <Profile label="Target Market" value={profile.basicInfo?.targetMarket} />
            </div>

            {/* ================= CULTURE SUMMARY ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Culture Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.cultureProfile?.summary || "—"}
              </p>
            </div>

            {/* ================= VALUES ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                What We Value
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {profile.cultureProfile?.whatWeValue?.length > 0 ? (
                  profile.cultureProfile.whatWeValue.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))
                ) : (
                  <li>—</li>
                )}
              </ul>
            </div>

            {/* ================= HOW WE WORK ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                How We Work
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.cultureProfile?.howWeWork || "—"}
              </p>
            </div>

            {/* ================= MANAGERIAL STYLE ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Managerial Style
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.cultureProfile?.managerialStyle || "—"}
              </p>
            </div>

            {/* ================= TRAITS ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Traits That Thrive Here
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {profile.cultureProfile?.employeeTraitsThatThriveHere?.length > 0 ? (
                  profile.cultureProfile.employeeTraitsThatThriveHere.map(
                    (t, i) => <li key={i}>{t}</li>
                  )
                ) : (
                  <li>—</li>
                )}
              </ul>
            </div>

            {/* ================= WHY JOIN US ================= */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Why Join Us
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.cultureProfile?.whyJoinUs || "—"}
              </p>
            </div>

            {/* <div className="text-xs text-gray-400 pt-4 border-t">
              Built from {profile.builtFromCultureInterviews || 0} culture interview(s)
            </div> */}

          </div>
        )}

        {!loading && !profile && (
          <p className="text-sm text-gray-500">
            No company culture profile generated yet.
          </p>
        )}
      </div>
    </div>
  );
}

function Profile({ label, value }) {
  return (
    <div className="mb-2">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-medium text-gray-900">
        {value || "—"}
      </div>
    </div>
  );
}
