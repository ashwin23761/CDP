import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../../api/posts";
import PostCard from "./PostCard";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#1C1C2E]" />
        <div className="flex flex-col gap-1.5"><div className="h-2.5 w-24 rounded bg-[#1C1C2E]" /><div className="h-2 w-16 rounded bg-[#1C1C2E]" /></div>
      </div>
      <div className="h-6 w-3/4 rounded bg-[#1C1C2E] mb-3" />
      <div className="space-y-2"><div className="h-3 w-full rounded bg-[#1C1C2E]" /><div className="h-3 w-5/6 rounded bg-[#1C1C2E]" /></div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'votes', label: 'Top Voted' },
  { value: 'comments', label: 'Most Discussed' },
];

export default function PostList({ groupId, newPost }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('newest');

  const fetchPosts = async (currentSort) => {
    setLoading(true);
    try {
      const res = await getAllPosts(groupId, currentSort);
      if (res.success) setPosts(res.data);
    } catch {
      setError("Could not load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(sort); }, [groupId, sort]);

  useEffect(() => {
    if (newPost) setPosts(prev => [newPost, ...prev]);
  }, [newPost]);

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.post_id !== postId));
  };

  const handleTagClick = (tag) => {
    navigate(`/search?tag=${tag}`);
  };

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4" data-testid="sort-controls">
        <span className="text-xs text-[#2E2E42] font-body mr-1">Sort:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            data-testid={`sort-${opt.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
              sort === opt.value
                ? 'bg-[#C8FF00] text-[#090910] font-bold'
                : 'border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] hover:border-[#2E2E42]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">{[1, 2, 3].map(n => <SkeletonCard key={n} />)}</div>
      ) : error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-center"><p className="text-red-400 font-body text-sm">{error}</p></div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-4xl text-[#1C1C2E] tracking-wider mb-2">NO POSTS YET</p>
          <p className="text-sm text-[#2E2E42] font-body">Be the first to start a discussion.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <PostCard key={post.post_id} post={post} onPostDeleted={handlePostDeleted} onTagClick={handleTagClick} />
          ))}
        </div>
      )}
    </div>
  );
}
