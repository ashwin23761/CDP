import { useState } from "react";
import Navbar from "../components/Navbar";
import CreatePostForm from "../components/posts/CreatePostForm";
import PostList from "../components/posts/PostList";

export default function HomePage() {
  // Lift new post up from CreatePostForm → pass down to PostList
  const [newPost, setNewPost] = useState(null);

  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* Ambient accent glow in the background */}
      <div
        className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2
                      w-[600px] h-[400px] rounded-full opacity-[0.04] blur-[120px]"
        style={{ backgroundColor: "#C8FF00" }}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="font-display text-6xl tracking-wider text-[#F0F0FF] leading-none">
            DISCUSSIONS
          </h1>
          <p className="text-sm text-[#52526E] font-body mt-2">
            Speak freely. Stay anonymous.
          </p>
        </div>

        {/* Member B owns these two components */}
        <CreatePostForm onPostCreated={(post) => setNewPost(post)} />
        <PostList newPost={newPost} />
      </main>
    </div>
  );
}