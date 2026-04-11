import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchPosts } from '../api/posts';
import PostCard from '../components/posts/PostCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(q);
  const [localTag, setLocalTag] = useState(tag);

  const doSearch = async (searchQ, searchTag) => {
    setLoading(true);
    try {
      const res = await searchPosts(searchQ || undefined, searchTag || undefined);
      if (res.success) setPosts(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (q || tag) doSearch(q, tag);
    else setLoading(false);
  }, [q, tag]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (localQuery.trim()) params.set('q', localQuery.trim());
    if (localTag.trim()) params.set('tag', localTag.trim());
    navigate(`/search?${params.toString()}`);
  };

  const handleTagClick = (clickedTag) => {
    navigate(`/search?tag=${clickedTag}`);
  };

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="font-display text-6xl tracking-wider text-[#F0F0FF] leading-none">
          SEARCH
        </h1>
        <p className="text-sm text-[#52526E] font-body mt-2">
          Find posts by keyword or tag
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3" data-testid="search-form">
        <div className="flex gap-3">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search posts..."
            data-testid="search-query-input"
            className="flex-1 px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
          />
          <input
            type="text"
            value={localTag}
            onChange={(e) => setLocalTag(e.target.value)}
            placeholder="#tag"
            data-testid="search-tag-input"
            className="w-32 px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#C8FF00] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body text-sm"
          />
          <button
            type="submit"
            data-testid="search-submit-button"
            className="px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 transition-all"
          >
            Search
          </button>
        </div>

        {/* Active filters */}
        {(q || tag) && (
          <div className="flex items-center gap-2 text-xs text-[#52526E] font-body">
            <span>Showing results for:</span>
            {q && <span className="px-2 py-0.5 rounded bg-[#1C1C2E] text-[#F0F0FF]">"{q}"</span>}
            {tag && <span className="px-2 py-0.5 rounded bg-[#1C1C2E] text-[#C8FF00]">#{tag}</span>}
            <button onClick={() => { setLocalQuery(''); setLocalTag(''); navigate('/search'); }} className="text-red-400 hover:text-red-300 ml-2">Clear</button>
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center text-[#52526E] py-10">Searching...</div>
      ) : !q && !tag ? (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-3xl text-[#1C1C2E] tracking-wider mb-2">
            START SEARCHING
          </p>
          <p className="text-sm text-[#2E2E42] font-body">
            Enter a keyword or tag to find posts
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-3xl text-[#1C1C2E] tracking-wider mb-2">
            NO RESULTS
          </p>
          <p className="text-sm text-[#2E2E42] font-body">
            Try a different keyword or tag
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#52526E] font-body">{posts.length} result{posts.length !== 1 ? 's' : ''} found</p>
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} onTagClick={handleTagClick} />
          ))}
        </div>
      )}
    </main>
  );
}
