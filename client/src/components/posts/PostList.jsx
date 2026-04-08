import { useEffect, useState } from "react";
import { getAllPosts } from "../../api/posts";
import PostCard from "./PostCard";

// Skeleton placeholder shown while loading
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#1C1C2E]" />
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-24 rounded bg-[#1C1C2E]" />
          <div className="h-2 w-16 rounded bg-[#1C1C2E]" />
        </div>
      </div>
      <div className="h-6 w-3/4 rounded bg-[#1C1C2E] mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-[#1C1C2E]" />
        <div className="h-3 w-5/6 rounded bg-[#1C1C2E]" />
        <div className="h-3 w-4/6 rounded bg-[#1C1C2E]" />
      </div>
    </div>
  );
}

export default function PostList({ newPost }) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Initial fetch
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts();
        if (res.success) setPosts(res.data);
      } catch {
        setError("Could not load posts. Is the server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Prepend optimistically when CreatePostForm emits a new post
  useEffect(() => {
    if (newPost) setPosts((prev) => [newPost, ...prev]);
  }, [newPost]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-center">
        <p className="text-red-400 font-body text-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
        <p className="font-display text-4xl text-[#1C1C2E] tracking-wider mb-2">
          NO POSTS YET
        </p>
        <p className="text-sm text-[#2E2E42] font-body">
          Be the first to start a discussion.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} />
      ))}
    </div>
  );
}
