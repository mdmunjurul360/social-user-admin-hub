import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 🔐 Admin protect
  if (user?.email !== "") {
    return <h1 className="text-center mt-20 text-xl">❌ Not Authorized</h1>;
  }

  const handlePost = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          author: user?.email,
        }),
      });

      const data = await res.json();
      console.log(data);

      alert("✅ Post Created");

      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("❌ Failed");
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🔥 Admin Dashboard</h1>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-xl">
        <input
          type="text"
          placeholder="Post title"
          className="w-full mb-4 p-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Post content"
          className="w-full mb-4 p-3 border rounded"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={handlePost}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
        >
          🚀 Publish Post
        </button>
      </div>
    </div>
  );
};

export default Admin;
