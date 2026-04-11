import { useState } from "react";
import CreatePostForm from "../components/posts/CreatePostForm";
import PostList from "../components/posts/PostList";

export default function HomePage() {
  const [newPost, setNewPost] = useState(null);

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="font-display text-6xl tracking-wider text-[#F0F0FF] leading-none">
          FEED
        </h1>
        <p className="text-sm text-[#52526E] font-body mt-2">
          Latest discussions from all groups
        </p>
      </div>

      <CreatePostForm onPostCreated={(post) => setNewPost(post)} />
      <PostList newPost={newPost} />
    </main>
  );
}
