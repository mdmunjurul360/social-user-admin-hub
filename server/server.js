const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 fake database (temporary)
let posts = [];

// ✅ CREATE POST
app.post("/api/posts", (req, res) => {
  const newPost = {
    ...req.body,
    id: Date.now(),
  };
  posts.push(newPost);
  res.json({ success: true, post: newPost });
});

// ✅ GET POSTS
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// root
app.get("/", (req, res) => {
  res.send("🔥 Server running");
});

app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});