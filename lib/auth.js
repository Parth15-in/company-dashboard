//lib/auth.js
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"; // e.g. "1d", "7d"

// Convert EXPIRES_IN to seconds for cookies
function convertExpiryToSeconds(str) {
  const num = parseInt(str);
  if (str.endsWith("d")) return num * 24 * 60 * 60;
  if (str.endsWith("h")) return num * 60 * 60;
  if (str.endsWith("m")) return num * 60;
  return 24 * 60 * 60; // default 1 day
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function setTokenCookie(res, token) {
  const maxAge = convertExpiryToSeconds(EXPIRES_IN);

  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",       // better security for admin dashboards
    path: "/",
    maxAge,
    encode: String,           // prevents double encoding
  });

  res.setHeader("Set-Cookie", cookie);
}

export function clearTokenCookie(res) {
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  res.setHeader("Set-Cookie", cookie);
}
