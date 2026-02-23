// import mongoose from "mongoose";
// import dbConnect from "@/lib/db";
// import CompanyOnboarding from "../../../../models/CompanyOnboarding";

// export default async function handler(req, res) {
//    if (req.method !== "GET") {
//     return res.status(405).json({ ok: false });
//   }

//   try {
//     await dbConnect();

//     const { companyId } = req.query;

//     if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
//       return res.status(400).json({
//         ok: false,
//         message: "Invalid companyId",
//       });
//     }

   
//     const profile = await CompanyOnboarding.findOne({
//       companyId: new mongoose.Types.ObjectId(companyId),
//     }).lean();

//     if (!profile) {
//       return res.status(404).json({
//         ok: false,
//         message: "Company profile not found",
//       });
//     }

//     return res.status(200).json({ ok: true, profile });
//   } catch (err) {
//     console.error("Company profile API error:", err);
//     return res.status(500).json({ ok: false, message: err.message });
//   }
// }

import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import CompanyCultureProfile from "../../../../models/CompanyCultureProfile";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false });
  }

  try {
    await dbConnect();

    const { companyId } = req.query;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid companyId",
      });
    }

    const profile = await CompanyCultureProfile.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
    }).lean();

    if (!profile) {
      return res.status(404).json({
        ok: false,
        message: "Company culture profile not generated yet",
      });
    }

    return res.status(200).json({
      ok: true,
      profile,
    });
  } catch (err) {
    console.error("Company culture profile API error:", err);
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}
