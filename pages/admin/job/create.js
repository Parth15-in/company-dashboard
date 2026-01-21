import { useState } from "react";
import { useRouter } from "next/router";

export default function CreateJob() {
  const router = useRouter();

  const [form, setForm] = useState({
    jd: "",
    jobRole: "",
    qualification: "",
    criteria: "",
    aptitude: 0,
    technical: 0,
    softskill: 0,
    isActive: true,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitJob = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/job/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    alert(data.message);

    if (res.status === 201) router.push("/admin/job/list");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Job</h1>

      <form onSubmit={submitJob} className="space-y-4">
        <textarea
          name="jd"
          placeholder="Job Description"
          className="border p-2 w-full"
          rows={4}
          onChange={handleChange}
        />

        <input
          name="jobRole"
          placeholder="Job Role"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="qualification"
          placeholder="Qualification"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="criteria"
          placeholder="Criteria"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            name="aptitude"
            placeholder="Aptitude Q"
            className="border p-2"
            onChange={handleChange}
          />

          <input
            type="number"
            name="technical"
            placeholder="Technical Q"
            className="border p-2"
            onChange={handleChange}
          />

          <input
            type="number"
            name="softskill"
            placeholder="Softskill Q"
            className="border p-2"
            onChange={handleChange}
          />
        </div>

        <select
          name="isActive"
          className="border p-2 w-full"
          onChange={handleChange}
        >
          <option value={true}>Active</option>
          <option value={false}>Inactive</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Job
        </button>
      </form>
    </div>
  );
}
