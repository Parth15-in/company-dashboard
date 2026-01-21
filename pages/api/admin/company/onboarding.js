import dbConnect from "../../../../lib/db";
import CompanyOnboarding from "../../../../models/CompanyOnboarding";
import Company from "../../../../models/company";
import Admin from "../../../../models/admin";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const token = verifyTokenFromReq(req);
    if (!token || !token.adminId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    // ✅ Verify user is actually an admin
    const admin = await Admin.findById(token.adminId);
    if (!admin) {
      return res.status(401).json({ ok: false, error: "Admin not found" });
    }

    const companyId = token.companyId;
    const body = req.body;

    if (!companyId || !body.industry || !body.companyType) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Save or update onboarding
    await CompanyOnboarding.findOneAndUpdate(
      { companyId },
      {
        companyId,
        ...body,
        sampleClients: body.sampleClients
          ? body.sampleClients.split(",").map((c) => c.trim())
          : [],
      },
      { upsert: true }
    );

    // ✅ Mark onboarding complete
    await Company.findByIdAndUpdate(companyId, {
      onboardingCompleted: true,
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Onboarding error:", err);
    return res.status(500).json({ ok: false, error: "Failed to save onboarding" });
  }
}
