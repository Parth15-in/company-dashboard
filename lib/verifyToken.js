//lib/verifyToken.js
import jwt from "jsonwebtoken";

export function verifyTokenFromReq(req) {
  try {
    const cookieHeader = req.headers.cookie || "";
    if (!cookieHeader) return null;

    // Parse cookies safely
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, v.join("=")];
      })
    );

    if (!cookies.token) return null;

    // Token may be URL encoded → decode it
    const token = decodeURIComponent(cookies.token);

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    return payload; // { adminId, companyId, email }
  } catch (err) {
    // JWT expired, invalid, tampered, etc.
    console.warn("JWT verification failed:", err.message);
    return null;
  }
}
