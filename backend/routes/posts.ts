import express from "express";
import Post from "../models/Post";

const router = express.Router();

// GET পোস্ট
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("user");
  res.json(posts);
});

// CREATE পোস্ট
router.post("/", async (req, res) => {
  const post = await Post.create(req.body);
  res.json(post);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;