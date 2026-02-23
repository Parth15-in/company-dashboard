import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1: Account Info
    name: "",
    email: "",
    password: "",
    // Step 2: Company Basic Info
    companyName: "",
    website:"",
    industry: "",
    companyType: "",
    location: "",
    employeeSize: "",
    hierarchyLevel: "",
    communicationStyle: "",
    feedbackCulture: "",
    // Step 3: Clients & Pressure
    targetMarket: "",
    sampleClients: "",
    workPressure: "",
    departments: "",
  });
const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [employees, setEmployees] = useState([]);
  const handleChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };
 
  const handleEmployeeChange = (key, value) => {
    setEmployeeForm((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const addEmployee = () => {
    const employeeErrors = {};
    if (!employeeForm.name.trim()) employeeErrors.name = "Name is required";
    if (!employeeForm.email.trim()) employeeErrors.email = "Email is required";
    if (!employeeForm.role) employeeErrors.role = "Role is required";
    if (!employeeForm.password.trim()) employeeErrors.password = "Password is required";

    if (Object.keys(employeeErrors).length > 0) {
      setErrors(employeeErrors);
      return;
    }

    setEmployees((p) => [...p, { ...employeeForm }]);
    setEmployeeForm({ name: "", email: "", role: "", password: "" });
    setErrors({});
  };

  const removeEmployee = (index) => {
    setEmployees((p) => p.filter((_, i) => i !== index));
  };
  const validateStep = () => {
    const e = {};

    if (step === 1) {
      if (!form.companyName.trim()) e.companyName = "Company name is required";
      if (!form.industry.trim()) e.industry = "Industry is required";
      if(!form.website.trim()) e.website="Website is required";
      if (!form.companyType) e.companyType = "Select company type";
      if (!form.location.trim()) e.location = "Location is required";
      if (!form.hierarchyLevel) e.hierarchyLevel = "Select hierarchy level";
      if (!form.communicationStyle) e.communicationStyle = "Select communication style";
      if (!form.feedbackCulture) e.feedbackCulture = "Select feedback culture"; 
     
    }

    if (step === 2) {
        if (!form.targetMarket.trim()) e.targetMarket = "Target market is required";
      if (!form.workPressure) e.workPressure = "Select work pressure";
      if (!form.name.trim()) e.name = "Your name is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";
      if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters"; 
    }
    

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep() && setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    // Only submit on step 3
    if (step !== 3) return;
    
    if (!validateStep()) return;

    setLoading(true);
    const payload = {
      ...form,
      employees: employees,
    };

    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Company onboarded successfully! Please log in.");
        return router.push("/admin/login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Company Onboarding</h1>
        {/* <p className="text-sm text-gray-600 mt-1 mb-6">
          Step {step} of 4 · Complete your company setup
        </p> */}

        {/* Progress Bar */}
        <div className="flex gap-2 m-8">
          {[1, 2,3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${step >= s ? "bg-indigo-600" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Account Info */}
          {step === 1 && (
            <Section title="Company Information">
             <Input
                label="Company Name *"
                value={form.companyName}
                onChange={(v) => handleChange("companyName", v)}
                error={errors.companyName}
              />
              <Input
                label="Industry *"
                value={form.industry}
                onChange={(v) => handleChange("industry", v)}
                error={errors.industry}
              />
              <Input
                label="Website *"
                value={form.website}
                onChange={(v) => handleChange("website", v)}
                error={errors.website}
              />
             
              <Input
                label="Location *"
                value={form.location}
                onChange={(v) => handleChange("location", v)}
                error={errors.location}
              />
              <Input
                label="Employee Size"
                value={form.employeeSize}
                onChange={(v) => handleChange("employeeSize", v)}
              />
               <Input
                label="Number of departments"
                value={form.departments}
                onChange={(v) => handleChange("departments", v)}
              />
               <Select
                label="Company Type *"
                value={form.companyType}
                onChange={(v) => handleChange("companyType", v)}
                options={["Startup", "MNC", "PSU", "Family Business"]}
                error={errors.companyType}
              />
                   <Select
                label="Hierarchy Level *"
                value={form.hierarchyLevel}
                onChange={(v) => handleChange("hierarchyLevel", v)}
                options={["Flat", "Moderate", "Strict"]}
                error={errors.hierarchyLevel}
              />
              <Select
                label="Communication Style *"
                value={form.communicationStyle}
                onChange={(v) => handleChange("communicationStyle", v)}
                options={["formal", "informal", "email-heavy", "chat-based", "meeting-driven"]}
                error={errors.communicationStyle}
              />
              <Select
                label="Feedback Culture *"
                value={form.feedbackCulture}
                onChange={(v) => handleChange("feedbackCulture", v)}
                options={["frequent", "rare", "safe", "avoided", "hierarchical"]}
                error={errors.feedbackCulture}
              />
            </Section>
          )}

          {/* Step 2: Company Basic Info */}
          {step === 2 && (
            <Section>
               <Input
                label="Target Market *"
                value={form.targetMarket}
                onChange={(v) => handleChange("targetMarket", v)}
                error={errors.targetMarket}
              />
              <Input
                label="Sample Clients"
                value={form.sampleClients}
                onChange={(v) => handleChange("sampleClients", v)}
              />
              <Select
                label="Work Pressure *"
                value={form.workPressure}
                onChange={(v) => handleChange("workPressure", v)}
                options={["low", "medium", "high"]}
                error={errors.workPressure}
              />
              <Input
                label="Your Name *"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                error={errors.name}
              />
              <Input
                label="Email *"
                type="email"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
                error={errors.email}
              />
              <Input
                label="Password *"
                type="password"
                value={form.password}
                onChange={(v) => handleChange("password", v)}
                error={errors.password}
              />
            </Section>
            
          )}

          {/* Step 3: Work Culture */}
          {/* {step === 3 && (
            <Section title="Work Culture">
         
            </Section>
          )} */}

          {/* Step 3: Add Employee */}
         {step === 3 && (
          <Section title="Add Employees (Optional)">
            <div className="md:col-span-2">
              <div className="bg-blue-50 p-4 rounded mb-6">
                <p className="text-sm text-gray-700">Add team members who will help manage interviews. You can add more employees later.</p>
              </div>

              {/* Employee Form */}
              <div className="border border-gray-200 rounded p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Employee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    value={employeeForm.name}
                    onChange={(v) => handleEmployeeChange("name", v)}
                    error={errors.name}
                  />
                  <Input
                    label="Email *"
                    value={employeeForm.email}
                    onChange={(v) => handleEmployeeChange("email", v)}
                    error={errors.email}
                  />
                  
                    <Input
                    label="Role *"
                    value={employeeForm.role}
                    onChange={(v) => handleEmployeeChange("role", v)}
                    error={errors.role}
                  />
                  <Input
                    label="Password *"
                    value={employeeForm.password}
                    onChange={(v) => handleEmployeeChange("password", v)}
                    error={errors.password}
                    type="password"
                  />
                </div>
                <button
                  onClick={addEmployee}
                  className="mt-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
                >
                  + Add Employee
                </button>
              </div>

              {/* Employees List */}
              {employees.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Added Employees ({employees.length})</h3>
                  <div className="space-y-2">
                    {employees.map((emp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-600">{emp.email} · {emp.role}</p>
                        </div>
                        <button
                          onClick={() => removeEmployee(idx)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="px-6 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50 hover:bg-gray-300"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* UI Components */
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg mt-1 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options, error }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg mt-1 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1"
      />
    </div>
  );
}
