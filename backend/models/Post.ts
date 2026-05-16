import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Post", postSchema);