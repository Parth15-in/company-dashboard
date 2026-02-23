import dbConnect from "../../../lib/db";
import Admin from "../../../models/admin";
import bcrypt from "bcryptjs";
import { signToken, setTokenCookie } from "../../../lib/auth";
import Company from "../../../models/company";
export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password are required" });
    }

    // Normalize email
    const lcEmail = email.trim().toLowerCase();

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(lcEmail)) {
      return res.status(400).json({ ok: false, message: "Invalid email format" });
    }

    const admin = await Admin.findOne({ email: lcEmail });
    if (!admin) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }
    const company = await Company.findById(admin.companyId);
    
    if (!company) {
      return res.status(401).json({ ok: false, message: "Company not found" });
    }

    // Create JWT payload
    const token = signToken({
      adminId: admin._id,
      companyId: admin.companyId,
      email: admin.email,
    });

    // Set secure cookie
    setTokenCookie(res, token);

    return res.status(200).json({
      ok: true,
      message: "Login successful",
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role ,  cultureInterviewCompleted: admin.cultureInterviewCompleted,},
      company: {
        id: company._id,
        onboardingCompleted: company.onboardingCompleted,
      },
    });

  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ ok: false, message: "Signin failed" });
  }
}
