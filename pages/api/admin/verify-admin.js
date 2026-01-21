import { verifyTokenFromReq } from "../../../lib/verifyToken";
import dbConnect from "../../../lib/db";
import Admin from "../../../models/admin";

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Database connection failed" });
  }

  try {
    const token = verifyTokenFromReq(req);
    
    if (!token || !token.adminId) {
      return res.status(401).json({ ok: false, isAdmin: false, error: "Unauthorized" });
    }

    // Fetch admin to verify they exist and have proper role
    const admin = await Admin.findById(token.adminId);
    
    if (!admin) {
      return res.status(401).json({ ok: false, isAdmin: false, error: "Admin not found" });
    }

    // ✅ Verified as admin
    return res.status(200).json({ 
      ok: true, 
      isAdmin: true,
      admin: { id: admin._id, email: admin.email, name: admin.name }
    });

  } catch (err) {
    console.error("Verify admin error:", err);
    return res.status(401).json({ ok: false, isAdmin: false, error: "Verification failed" });
  }
}
