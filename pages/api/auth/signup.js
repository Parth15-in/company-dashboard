import dbConnect from "../../../lib/db";
import User from "../../../models/company";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  try {
    await dbConnect();

    const { name, email, phone, address, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}
