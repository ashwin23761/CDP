import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { voteOnPost, getUserVote } from '../../api/votes';
import { getCommentsByPost, createComment, deleteComment } from '../../api/comments';
import { updatePost, deletePost } from '../../api/posts';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const AVATAR_COLORS = ["#C8FF00","#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#FB923C","#34D399","#F472B6"];
const avatarColor = (id) => AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];

// Build nested tree from flat comments list
function buildCommentTree(flatComments) {
  const map = {};
  const roots = [];
  flatComments.forEach(c => { map[c.comment_id] = { ...c, replies: [] }; });
  flatComments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.comment_id]);
    } else {
      roots.push(map[c.comment_id]);
    }
  });
  return roots;
}

// Recursive comment component
function CommentNode({ comment, depth, postId, currentUserId, onReply, onDelete }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAuthor = currentUserId === comment.user_id;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await createComment({ post_id: postId, content: replyText.trim(), parent_id: comment.comment_id });
      if (res.success) {
        onReply(res.data);
        setReplyText('');
        setReplying(false);
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteComment(comment.comment_id);
      if (res.success) onDelete(comment.comment_id);
    } catch (err) { console.error(err); }
  };

  return (
    <div className={depth > 0 ? 'ml-6 pl-3 border-l border-[#1C1C2E]' : ''} data-testid={`comment-${comment.comment_id}`}>
      <div className="flex gap-2 py-2">
        <Link to={`/profile/${comment.user_id}`} className="w-6 h-6 rounded-full flex items-center justify-center text-[#090910] text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: avatarColor(comment.user_id) }}>
          {String(comment.user_id ?? "?").slice(-2)}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link to={`/profile/${comment.user_id}`} className="text-xs text-[#52526E] font-body hover:text-[#C8FF00]">{comment.anonymous_name || `User #${comment.user_id}`}</Link>
            <span className="text-[9px] text-[#2E2E42] font-body">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-[#F0F0FF] font-body mb-1">{comment.content}</p>
          <div className="flex items-center gap-3">
            {depth < 3 && (
              <button onClick={() => setReplying(!replying)} data-testid={`reply-btn-${comment.comment_id}`} className="text-[10px] text-[#52526E] hover:text-[#C8FF00] transition-colors font-body">
                Reply
              </button>
            )}
            {isAuthor && (
              <button onClick={handleDelete} data-testid={`delete-comment-btn-${comment.comment_id}`} className="text-[10px] text-[#52526E] hover:text-red-400 transition-colors font-body">
                Delete
              </button>
            )}
          </div>

          {replying && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." data-testid={`reply-input-${comment.comment_id}`} className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body" />
              <button type="submit" disabled={!replyText.trim() || submitting} className="px-3 py-1.5 text-xs rounded-lg bg-[#C8FF00] text-[#090910] font-bold hover:bg-[#d8ff33] disabled:opacity-50 transition-all font-body">{submitting ? '...' : 'Reply'}</button>
            </form>
          )}
        </div>
      </div>
      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentNode key={reply.comment_id} comment={reply} depth={depth + 1} postId={postId} currentUserId={currentUserId} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostCard({ post, onPostDeleted, onTagClick }) {
  const { user } = useAuth();
  const { post_id, user_id, title, content, created_at, group_name, group_id, anonymous_name, tags } = post;
  const color = avatarColor(user_id);
  const isAuthor = user?.user_id === user_id;
  const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const [voteCount, setVoteCount] = useState(parseInt(post.vote_total) || 0);
  const [upvotes, setUpvotes] = useState(parseInt(post.upvotes) || 0);
  const [downvotes, setDownvotes] = useState(parseInt(post.downvotes) || 0);
  const [userVote, setUserVote] = useState(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserVote = async () => {
      try {
        const res = await getUserVote(post_id);
        if (res.success) {
          setUserVote(res.data);
        }
      } catch (err) {
        console.error('Failed to load user vote', err);
      }
    };

    fetchUserVote();
  }, [post_id, user]);

  const [showComments, setShowComments] = useState(false);
  const [flatComments, setFlatComments] = useState([]);
  const [commentCount, setCommentCount] = useState(parseInt(post.comment_count) || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [editTags, setEditTags] = useState(tagList.join(', '));
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const commentTree = buildCommentTree(flatComments);

  const handleVote = async (voteType) => {
    if (voting) return;
    setVoting(true);
    try {
      await voteOnPost({ post_id, vote_type: voteType });
      if (userVote === voteType) {
        setUserVote(null);
        if (voteType === 'UPVOTE') { setUpvotes(u => u - 1); setVoteCount(v => v - 1); }
        else { setDownvotes(d => d - 1); setVoteCount(v => v + 1); }
      } else if (userVote) {
        setUserVote(voteType);
        if (voteType === 'UPVOTE') { setUpvotes(u => u + 1); setDownvotes(d => d - 1); setVoteCount(v => v + 2); }
        else { setUpvotes(u => u - 1); setDownvotes(d => d + 1); setVoteCount(v => v - 2); }
      } else {
        setUserVote(voteType);
        if (voteType === 'UPVOTE') { setUpvotes(u => u + 1); setVoteCount(v => v + 1); }
        else { setDownvotes(d => d + 1); setVoteCount(v => v - 1); }
      }
    } catch (err) { console.error(err); }
    finally { setVoting(false); }
  };

  const loadComments = async () => {
    if (flatComments.length > 0) { setShowComments(!showComments); return; }
    setLoadingComments(true);
    setShowComments(true);
    try {
      const res = await getCommentsByPost(post_id);
      if (res.success) setFlatComments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingComments(false); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await createComment({ post_id, content: newComment.trim() });
      if (res.success) {
        setFlatComments(prev => [...prev, res.data]);
        setCommentCount(c => c + 1);
        setNewComment('');
      }
    } catch (err) { console.error(err); }
    finally { setSubmittingComment(false); }
  };

  const handleReplyAdded = (newReply) => {
    setFlatComments(prev => [...prev, newReply]);
    setCommentCount(c => c + 1);
  };

  const handleCommentDeleted = (commentId) => {
    // Remove comment and all its children
    const idsToRemove = new Set();
    const findChildren = (parentId) => {
      flatComments.forEach(c => {
        if (c.parent_id === parentId) {
          idsToRemove.add(c.comment_id);
          findChildren(c.comment_id);
        }
      });
    };
    idsToRemove.add(commentId);
    findChildren(commentId);
    setFlatComments(prev => prev.filter(c => !idsToRemove.has(c.comment_id)));
    setCommentCount(c => Math.max(0, c - idsToRemove.size));
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const parsedTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await updatePost(post_id, { title: editTitle.trim(), content: editContent.trim(), tags: parsedTags });
      if (res.success) {
        post.title = editTitle.trim();
        post.content = editContent.trim();
        post.tags = parsedTags.join(',');
        setEditing(false);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await deletePost(post_id);
      if (res.success) { setDeleted(true); if (onPostDeleted) onPostDeleted(post_id); }
    } catch (err) { console.error(err); }
  };

  if (deleted) return null;

  return (
    <article data-testid={`post-card-${post_id}`} className="post-card group relative rounded-xl border border-[#1C1C2E] bg-[#101018] overflow-hidden hover:border-[#2E2E42] hover:bg-[#13131F] transition-all duration-300">
      <span className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: color }} />
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/profile/${user_id}`} className="w-8 h-8 rounded-full flex items-center justify-center text-[#090910] text-xs font-bold shrink-0 hover:ring-2 hover:ring-[#C8FF00] transition-all" style={{ backgroundColor: color }}>
            {String(user_id ?? "?").slice(-2)}
          </Link>
          <div className="flex flex-col leading-tight flex-1">
            <Link to={`/profile/${user_id}`} className="text-xs text-[#52526E] font-body hover:text-[#C8FF00] transition-colors">{anonymous_name || `User #${user_id}`}</Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#2E2E42] font-body">{created_at ? timeAgo(created_at) : "unknown"}</span>
              {group_name && (
                <>
                  <span className="text-[10px] text-[#2E2E42]">·</span>
                  <Link to={`/groups/${group_id}`} className="text-[10px] text-[#C8FF00] hover:underline">{group_name}</Link>
                </>
              )}
            </div>
          </div>
          {isAuthor && (
            <div className="relative">
              <button data-testid={`post-menu-btn-${post_id}`} onClick={() => setShowMenu(!showMenu)} className="w-7 h-7 rounded-full border border-[#1C1C2E] hover:border-[#C8FF00] flex items-center justify-center text-[#52526E] hover:text-[#C8FF00] transition-all text-xs">···</button>
              {showMenu && (
                <div className="absolute right-0 top-9 z-20 w-32 rounded-lg border border-[#1C1C2E] bg-[#101018] shadow-lg overflow-hidden" style={{ animation: 'fadeUp 0.15s ease forwards' }}>
                  <button data-testid={`edit-post-btn-${post_id}`} onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs text-[#F0F0FF] hover:bg-[#1C1C2E] font-body transition-colors">Edit</button>
                  <button data-testid={`delete-post-btn-${post_id}`} onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-900/20 font-body transition-colors">Delete</button>
                </div>
              )}
            </div>
          )}
          <span className="text-[10px] font-mono text-[#2E2E42] border border-[#1C1C2E] rounded px-1.5 py-0.5">#{post_id}</span>
        </div>

        {/* Edit mode */}
        {editing ? (
          <div className="space-y-3">
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} data-testid={`edit-title-input-${post_id}`} className="w-full px-3 py-2 rounded-lg bg-[#0D0D15] border border-[#C8FF00] text-[#F0F0FF] focus:outline-none font-body text-base" />
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} data-testid={`edit-content-input-${post_id}`} className="w-full px-3 py-2 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] focus:outline-none focus:border-[#C8FF00] font-body text-sm" />
            <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="Tags (comma separated)" data-testid={`edit-tags-input-${post_id}`} className="w-full px-3 py-2 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] font-body text-xs" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-lg border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] text-xs font-body transition-colors">Cancel</button>
              <button data-testid={`save-edit-btn-${post_id}`} onClick={handleEdit} disabled={saving} className="px-4 py-1.5 rounded-lg bg-[#C8FF00] text-[#090910] font-bold text-xs hover:bg-[#d8ff33] disabled:opacity-50 transition-all font-body">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-display text-2xl tracking-wide text-[#F0F0FF] leading-tight mb-2">{post.title}</h3>
            <p className="text-sm text-[#52526E] font-body leading-relaxed line-clamp-3 mb-3">{post.content}</p>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tagList.map((tag, i) => (
                  <button key={i} onClick={() => onTagClick && onTagClick(tag)} className="px-2 py-0.5 rounded text-[10px] font-body bg-[#1C1C2E] text-[#C8FF00] hover:bg-[#C8FF00] hover:text-[#090910] transition-colors">#{tag}</button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {!editing && (
          <div className="pt-4 border-t border-[#1C1C2E] flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => handleVote('UPVOTE')} disabled={voting} data-testid={`upvote-btn-${post_id}`} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${userVote === 'UPVOTE' ? 'bg-[#C8FF00] text-[#090910]' : 'text-[#52526E] hover:text-[#C8FF00] hover:bg-[#1C1C2E]'}`}>
                <span className="text-sm">▲</span><span className="text-xs font-body">{upvotes}</span>
              </button>
              <span className={`text-sm font-bold px-2 ${voteCount > 0 ? 'text-[#C8FF00]' : voteCount < 0 ? 'text-red-400' : 'text-[#52526E]'}`}>{voteCount}</span>
              <button onClick={() => handleVote('DOWNVOTE')} disabled={voting} data-testid={`downvote-btn-${post_id}`} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${userVote === 'DOWNVOTE' ? 'bg-red-400 text-[#090910]' : 'text-[#52526E] hover:text-red-400 hover:bg-[#1C1C2E]'}`}>
                <span className="text-sm">▼</span><span className="text-xs font-body">{downvotes}</span>
              </button>
            </div>
            <button onClick={loadComments} data-testid={`comments-btn-${post_id}`} className="flex items-center gap-2 text-xs text-[#52526E] hover:text-[#C8FF00] transition-colors font-body">
              <span>💬</span><span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </button>
          </div>
        )}

        {/* Comments section — nested tree */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#1C1C2E]">
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex gap-2">
                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." data-testid={`comment-input-${post_id}`} className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body" />
                <button type="submit" disabled={!newComment.trim() || submittingComment} data-testid={`comment-submit-${post_id}`} className="px-4 py-2 text-sm rounded-lg bg-[#C8FF00] text-[#090910] font-bold hover:bg-[#d8ff33] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body">{submittingComment ? '...' : 'Post'}</button>
              </div>
            </form>

            {loadingComments ? (
              <div className="text-xs text-[#52526E] text-center py-2">Loading comments...</div>
            ) : commentTree.length === 0 ? (
              <div className="text-xs text-[#2E2E42] text-center py-2">No comments yet</div>
            ) : (
              <div className="space-y-1">
                {commentTree.map(c => (
                  <CommentNode key={c.comment_id} comment={c} depth={0} postId={post_id} currentUserId={user?.user_id} onReply={handleReplyAdded} onDelete={handleCommentDeleted} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
