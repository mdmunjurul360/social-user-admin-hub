import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});


// =======================
// ✅ 🔥 MONGODB CONNECT
// =======================
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log("❌ MONGODB_URI missing");
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
};

connectDB();


// =======================
// ✅ 🔥 MODELS (INLINE SAFE)
// =======================
const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  name: String,
  photo: String,
  role: { type: String, default: "user" },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  postId: String,
  userId: String,
  userName: String,
  content: String,
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);
const CommentModel = mongoose.models.Comment || mongoose.model("Comment", commentSchema);


// =======================
// ✅ 🔥 AUTH ROUTE
// =======================
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, email, name, photo } = req.body;

    let user = await UserModel.findOne({ uid });

    if (!user) {
      user = await UserModel.create({
        uid,
        email,
        name,
        photo,
      });
    }

    res.json(user);
  } catch (err) {
    console.log("AUTH ERROR:", err);
    res.status(500).json({ error: "Auth failed" });
  }
});


// =======================
// ✅ 🔥 POSTS API
// =======================

// GET POSTS
app.get("/api/posts", async (req, res) => {
  const posts = await PostModel.find().sort({ createdAt: -1 });
  res.json(posts);
});

// CREATE POST (admin)
app.post("/api/posts", async (req, res) => {
  const post = await PostModel.create(req.body);
  res.json(post);
});

// LIKE POST
app.post("/api/posts/:id/like", async (req, res) => {
  const { id } = req.params;

  const post = await PostModel.findByIdAndUpdate(
    id,
    { $inc: { likesCount: 1 } },
    { new: true }
  );

  res.json(post);
});


// =======================
// ✅ 🔥 COMMENTS API
// =======================

// GET COMMENTS
app.get("/api/comments/:postId", async (req, res) => {
  const comments = await CommentModel.find({
    postId: req.params.postId,
  });

  res.json(comments);
});

// ADD COMMENT
app.post("/api/comments", async (req, res) => {
  const comment = await CommentModel.create(req.body);

  await PostModel.findByIdAndUpdate(req.body.postId, {
    $inc: { commentsCount: 1 },
  });

  res.json(comment);
});


// =======================
// ✅ VITE (UNCHANGED)
// =======================
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

setupVite();