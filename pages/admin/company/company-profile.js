//pages/admin/company/company-profile.js
import { useEffect, useState } from "react";

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (typeof window === "undefined") return;
    const fetchProfile = async () => {
      try {
        const companyId = localStorage.getItem("companyId");

        if (!companyId) {
          alert("CompanyId not found. Please login again.");
          return;
        }

        const res = await fetch(`/api/admin/company/profile?companyId=${companyId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!data.ok) {
          alert(data.message || "Failed to fetch profile");
          return;
        }

        setProfile(data.profile);
      } catch (err) {
        alert("Something went wrong while fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6">Loading Company Profile...</p>;

  if (!profile) return <p className="p-6">No Company Profile Found</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Company Profile</h2>

      <div className="bg-white shadow-md rounded-lg p-5 space-y-2">
        <p><b>Company Name:</b> {profile.companyName}</p>
        <p><b>Industry:</b> {profile.industry}</p>
        <p><b>Website:</b> {profile.website}</p>
        <p><b>Company Type:</b> {profile.companyType}</p>
        <p><b>Location:</b> {profile.location}</p>
        <p><b>Employee Size:</b> {profile.employeeSize}</p>
        <p><b>Hierarchy Level:</b> {profile.hierarchyLevel}</p>
        <p><b>Communication Style:</b> {profile.communicationStyle}</p>
        <p><b>Collaboration Style:</b> {profile.collaborationStyle}</p>
        <p><b>Feedback Culture:</b> {profile.feedbackCulture}</p>
        <p><b>Target Market:</b> {profile.targetMarket}</p>
        <p><b>Work Pressure:</b> {profile.workPressure}</p>
        <p><b>Departments:</b> {profile.departments}</p>

        <p>
          <b>Sample Clients:</b>{" "}
          {profile.sampleClients?.length > 0
            ? profile.sampleClients.join(", ")
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
