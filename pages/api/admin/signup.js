// pages/api/admin/signup.js

import dbConnect from "../../../lib/db";
import Company from "../../../models/company";
import CompanyOnboarding from "../../../models/CompanyOnboarding";
import Admin from "../../../models/admin";
import bcrypt from "bcryptjs";
import { signToken, setTokenCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Database connection failed" });
  }

  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const {
      // Account info
      companyName,
      name,
      email,
      password,
      // Company basic info
      industry,
      website,
      companyType,
      location,
      employeeSize,
      // Work culture
      hierarchyLevel,
      communicationStyle,
      feedbackCulture,
      // Clients & pressure
      targetMarket,
      sampleClients,
      workPressure,
      departments,
    } = req.body;

    // ✔ Validate required fields
    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Missing required account fields" });
    }

    if (!industry || !companyType || !location) {
      return res.status(400).json({ ok: false, error: "Missing required company fields" });
    }

    if (!hierarchyLevel || !communicationStyle || !feedbackCulture) {
      return res.status(400).json({ ok: false, error: "Missing required culture fields" });
    }

    if (!targetMarket || !workPressure) {
      return res.status(400).json({ ok: false, error: "Missing required client fields" });
    }

    // ✔ Normalize fields
    const companyNameClean = companyName.trim().toLowerCase();
    const lcEmail = email.trim().toLowerCase();

    // ✔ Basic email format validation
    if (!/^\S+@\S+\.\S+$/.test(lcEmail)) {
      return res.status(400).json({ ok: false, error: "Invalid email format" });
    }

    // ✔ Password validation
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
    }

    // ✔ Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: lcEmail });
    if (existingAdmin) {
      return res.status(400).json({ ok: false, error: "Admin with this email already exists" });
    }

    // ✔ Check if company exists
    const existingCompany = await Company.findOne({ name: companyNameClean });

    let company;

    if (existingCompany) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        existingCompany._id,
        {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new company
      company = await Company.create({
        name: companyNameClean,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      });
    }

    // ✔ Create CompanyOnboarding document
    await CompanyOnboarding.findOneAndUpdate(
      { companyId: company._id },
      {
        companyId: company._id,
        companyName,
        industry,
        website,
        companyType,
        location,
        employeeSize,
        hierarchyLevel,
        communicationStyle,
        feedbackCulture,
        targetMarket,
        sampleClients: sampleClients
          ? sampleClients.split(",").map((c) => c.trim())
          : [],
        workPressure,
        departments,
        isCompleted: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    // ✅ Create employees if provided
    if (req.body.employees && Array.isArray(req.body.employees) && req.body.employees.length > 0) {
      for (const emp of req.body.employees) {
        // Validate required fields
        if (!emp.name || !emp.email || !emp.role || !emp.password) {
          continue; // Skip invalid entries
        }

        // Check if employee already exists
        const existingEmployee = await Admin.findOne({ email: emp.email.toLowerCase() });
        if (existingEmployee) {
          continue; // Skip if email already registered
        }

        // Hash password using bcryptjs (same as signin)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(emp.password, salt);

        // Create new employee/admin
        await Admin.create({
          name: emp.name,
          email: emp.email.toLowerCase(),
          passwordHash: passwordHash,
          companyId: company._id,
          role: emp.role.toLowerCase(), // hr, hod, leader
        });
      }
    }

    // ✔ Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ✔ Create admin under company
    const admin = await Admin.create({
      name,
      email: lcEmail,
      passwordHash,
      companyId: company._id,
    });

    // ✔ Create JWT token (not setting cookie - user must log in)
    const token = signToken({
      adminId: admin._id,
      companyId: company._id,
      email: admin.email,
    });

    return res.status(201).json({
      ok: true,
      message: "Signup and onboarding successful. Please log in.",
      admin: { id: admin._id, email: admin.email, name: admin.name },
      company: { id: company._id, name: company.name },
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ ok: false, error: "Signup failed" });
  }
}
