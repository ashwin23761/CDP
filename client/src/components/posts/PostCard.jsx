import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voteOnPost } from '../../api/votes';
import { getCommentsByPost, createComment } from '../../api/comments';

// Utility: human-readable relative time
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Stable color from user_id for the avatar dot
const AVATAR_COLORS = [
  "#C8FF00", "#FF6B6B", "#4ECDC4", "#FFE66D",
  "#A78BFA", "#FB923C", "#34D399", "#F472B6",
];
const avatarColor = (id) => AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];

export default function PostCard({ post }) {
  const { post_id, user_id, title, content, created_at, group_name, group_id, anonymous_name } = post;
  const color = avatarColor(user_id);
  
  const [voteCount, setVoteCount] = useState(parseInt(post.vote_total) || 0);
  const [upvotes, setUpvotes] = useState(parseInt(post.upvotes) || 0);
  const [downvotes, setDownvotes] = useState(parseInt(post.downvotes) || 0);
  const [userVote, setUserVote] = useState(null);
  const [voting, setVoting] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(parseInt(post.comment_count) || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleVote = async (voteType) => {
    if (voting) return;
    
    setVoting(true);
    try {
      await voteOnPost({ post_id, vote_type: voteType });
      
      // Toggle logic
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null);
        if (voteType === 'UPVOTE') {
          setUpvotes(upvotes - 1);
          setVoteCount(voteCount - 1);
        } else {
          setDownvotes(downvotes - 1);
          setVoteCount(voteCount + 1);
        }
      } else if (userVote) {
        // Change vote
        setUserVote(voteType);
        if (voteType === 'UPVOTE') {
          setUpvotes(upvotes + 1);
          setDownvotes(downvotes - 1);
          setVoteCount(voteCount + 2);
        } else {
          setUpvotes(upvotes - 1);
          setDownvotes(downvotes + 1);
          setVoteCount(voteCount - 2);
        }
      } else {
        // New vote
        setUserVote(voteType);
        if (voteType === 'UPVOTE') {
          setUpvotes(upvotes + 1);
          setVoteCount(voteCount + 1);
        } else {
          setDownvotes(downvotes + 1);
          setVoteCount(voteCount - 1);
        }
      }
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVoting(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }
    
    setLoadingComments(true);
    setShowComments(true);
    try {
      const response = await getCommentsByPost(post_id);
      if (response.success) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await createComment({
        post_id,
        content: newComment.trim()
      });
      
      if (response.success) {
        setComments([response.data, ...comments]);
        setCommentCount(commentCount + 1);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article
      className="post-card group relative rounded-xl border border-[#1C1C2E]
                 bg-[#101018] overflow-hidden
                 hover:border-[#2E2E42] hover:bg-[#13131F]
                 transition-all duration-300"
    >
      {/* Left accent stripe */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />

      <div className="p-5">
        {/* Top row: avatar + meta */}
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar dot */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-[#090910] text-xs font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {String(user_id ?? "?").slice(-2)}
          </div>

          <div className="flex flex-col leading-tight flex-1">
            <span className="text-xs text-[#52526E] font-body">
              {anonymous_name || `User #${user_id}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#2E2E42] font-body">
                {created_at ? timeAgo(created_at) : "unknown"}
              </span>
              {group_name && (
                <>
                  <span className="text-[10px] text-[#2E2E42]">•</span>
                  <Link 
                    to={`/groups/${group_id}`}
                    className="text-[10px] text-[#C8FF00] hover:underline"
                  >
                    {group_name}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Post ID badge */}
          <span
            className="text-[10px] font-mono text-[#2E2E42]
                       border border-[#1C1C2E] rounded px-1.5 py-0.5"
          >
            #{post_id}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display text-2xl tracking-wide text-[#F0F0FF]
                     leading-tight mb-2"
        >
          {title}
        </h3>

        {/* Content preview */}
        <p
          className="text-sm text-[#52526E] font-body leading-relaxed
                     line-clamp-3 mb-4"
        >
          {content}
        </p>

        {/* Footer - voting and comments */}
        <div className="pt-4 border-t border-[#1C1C2E] flex items-center gap-4">
          {/* Voting */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('UPVOTE')}
              disabled={voting}
              data-testid={`upvote-btn-${post_id}`}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                userVote === 'UPVOTE'
                  ? 'bg-[#C8FF00] text-[#090910]'
                  : 'text-[#52526E] hover:text-[#C8FF00] hover:bg-[#1C1C2E]'
              }`}
            >
              <span className="text-sm">▲</span>
              <span className="text-xs font-body">{upvotes}</span>
            </button>
            
            <span className={`text-sm font-bold px-2 ${
              voteCount > 0 ? 'text-[#C8FF00]' : voteCount < 0 ? 'text-red-400' : 'text-[#52526E]'
            }`}>
              {voteCount}
            </span>
            
            <button
              onClick={() => handleVote('DOWNVOTE')}
              disabled={voting}
              data-testid={`downvote-btn-${post_id}`}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                userVote === 'DOWNVOTE'
                  ? 'bg-red-400 text-[#090910]'
                  : 'text-[#52526E] hover:text-red-400 hover:bg-[#1C1C2E]'
              }`}
            >
              <span className="text-sm">▼</span>
              <span className="text-xs font-body">{downvotes}</span>
            </button>
          </div>

          {/* Comments button */}
          <button
            onClick={loadComments}
            data-testid={`comments-btn-${post_id}`}
            className="flex items-center gap-2 text-xs text-[#52526E] hover:text-[#C8FF00] transition-colors font-body"
          >
            <span>💬</span>
            <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#1C1C2E]">
            {/* New comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2 text-sm rounded-lg bg-[#C8FF00] text-[#090910] font-bold hover:bg-[#d8ff33] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body"
                >
                  {submittingComment ? '...' : 'Post'}
                </button>
              </div>
            </form>

            {/* Comments list */}
            {loadingComments ? (
              <div className="text-xs text-[#52526E] text-center py-2">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-xs text-[#2E2E42] text-center py-2">No comments yet</div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.comment_id} className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#090910] text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: avatarColor(comment.user_id) }}
                    >
                      {String(comment.user_id ?? "?").slice(-2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#52526E] font-body">
                          {comment.anonymous_name || `User #${comment.user_id}`}
                        </span>
                        <span className="text-[9px] text-[#2E2E42] font-body">
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#F0F0FF] font-body">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
