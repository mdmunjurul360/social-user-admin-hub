import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Post, Comment } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  // ✅ FETCH POSTS
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const data = await res.json();
      setPosts(data || []);
    } catch (err) {
      console.log("POST FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ FETCH COMMENTS
  useEffect(() => {
    if (!selectedPost) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${selectedPost.id}`);
        const data = await res.json();
        setComments(data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchComments();
  }, [selectedPost]);

  // ✅ LIKE
  const handleLike = async (post: Post) => {
    await fetch(`http://localhost:5000/api/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.uid })
    });

    fetchPosts(); // 🔥 refresh
  };

  // ✅ COMMENT
  const submitComment = async () => {
    if (!commentText || !selectedPost) return;

    await fetch(`http://localhost:5000/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId: selectedPost.id,
        userId: user?.uid,
        userName: user?.displayName,
        content: commentText
      })
    });

    setCommentText("");
    setSelectedPost(null);
    fetchPosts(); // 🔥 refresh
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {posts.length === 0 && <p>No posts yet 😑</p>}

      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 mb-4 shadow rounded">
          <h2 className="font-bold text-lg">{post.title}</h2>
          <p>{post.content}</p>

          <div className="flex gap-4 mt-2">
            <button onClick={() => handleLike(post)}>
              ❤️ {post.likesCount || 0}
            </button>

            <button onClick={() => setSelectedPost(post)}>
              💬 {post.commentsCount || 0}
            </button>
          </div>
        </div>
      ))}

      {/* COMMENTS */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="font-bold mb-2">Comments</h3>

            {comments.map(c => (
              <div key={c.id} className="border p-2 mb-2">
                <b>{c.userName}</b>
                <p>{c.content}</p>
              </div>
            ))}

            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border w-full p-2 mt-2"
            />

            <button onClick={submitComment} className="bg-blue-500 text-white px-3 py-1 mt-2">
              Send
            </button>

            <button onClick={() => setSelectedPost(null)} className="block mt-2 text-red-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;