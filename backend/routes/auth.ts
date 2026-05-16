import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();


// 🔥 USER MODEL (NEW ADD)
const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: { type: String, unique: true },
  photo: String,
  role: { type: String, default: "user" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);


// 🔥 GOOGLE AUTH ROUTE
router.post("/google", async (req, res) => {
  try {
    const { uid, name, email, photo } = req.body;

    // 🔥 USER CHECK (NEW ADD)
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      existingUser = await User.create({
        uid,
        name,
        email,
        photo,
      });
    }

    // 🔥 JWT TOKEN
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: existingUser,
    });

  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;