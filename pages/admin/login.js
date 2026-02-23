import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // VERY IMPORTANT for cookies
        body: JSON.stringify(form),
      });

      const data = await res.json();
if (!data.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ localStorage set (required for culture interview)
      localStorage.setItem("companyId", data.company.id);
      localStorage.setItem("userId", data.admin.id);
      localStorage.setItem("role", data.admin.role);

      // ✅ Employee / HOD / Leader
      if (data.admin.role !== "admin") {
        if (data.admin.cultureInterviewCompleted) {
          router.push("/admin"); // interview already done
        } else {
          router.push("employee/culture-interview"); // interview pending
        }
        return;
      }

      // ✅ Admin flow
      if (!data.company.onboardingCompleted) {
        router.push("/admin/signup");
      } else {
        router.push("/admin");
      }

    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Login..." : "Login"}
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
             New here?{" "}
              <Link href="/admin/signup" className="text-blue-600 hover:underline">
              Onboard your company
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
