import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupById, joinGroup, leaveGroup, getGroupMembers, deleteGroup } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import CreatePostForm from '../components/posts/CreatePostForm';
import PostList from '../components/posts/PostList';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newPost, setNewPost] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);

  const fetchGroup = async () => {
    try {
      const groupRes = await getGroupById(id);
      if (groupRes.success) {
        setGroup(groupRes.data);
      }
    } catch (err) {
      console.error('Failed to load group:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroup(); }, [id]);

  const handleJoinLeave = async () => {
    setActionLoading(true);
    try {
      if (group.is_member) {
        await leaveGroup(id);
        setGroup(prev => ({ ...prev, is_member: false, user_role: null, member_count: prev.member_count - 1 }));
      } else {
        await joinGroup(id);
        setGroup(prev => ({ ...prev, is_member: true, user_role: 'member', member_count: prev.member_count + 1 }));
      }
    } catch (err) {
      console.error('Failed to join/leave group:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowMembers = async () => {
    if (showMembers) { setShowMembers(false); return; }
    try {
      const res = await getGroupMembers(id);
      if (res.success) { setMembers(res.data); setShowMembers(true); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteGroup(id);
      navigate('/groups');
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert('Failed to delete group');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <main className="relative z-10 max-w-3xl mx-auto px-4 py-10"><div className="text-center text-[#52526E]">Loading group...</div></main>;
  }

  if (!group) {
    return <main className="relative z-10 max-w-3xl mx-auto px-4 py-10"><div className="text-center text-red-400">Group not found</div></main>;
  }

  const isPrivate = group.is_private === 1;
  const canViewPosts = group.is_member || !isPrivate;

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      {/* Group Header */}
      <div className="mb-10 rounded-xl border border-[#1C1C2E] bg-[#101018] p-6" data-testid="group-header">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl tracking-wider text-[#F0F0FF] leading-none">{group.name}</h1>
              {isPrivate && (
                <span className="text-xs text-[#C8FF00] border border-[#C8FF00] rounded px-2 py-1">Private</span>
              )}
              {group.user_role && (
                <span className="text-xs text-[#52526E] border border-[#1C1C2E] rounded px-2 py-1 capitalize">{group.user_role}</span>
              )}
            </div>
            <p className="text-sm text-[#52526E] font-body">{group.description || 'No description'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleJoinLeave}
              disabled={actionLoading}
              data-testid="join-leave-btn"
              className={`px-6 py-2.5 rounded-lg font-bold font-body text-sm tracking-wide transition-all duration-200 ${
                group.is_member
                  ? 'border border-[#1C1C2E] text-[#52526E] hover:text-red-400 hover:border-red-400'
                  : 'bg-[#C8FF00] text-[#090910] hover:bg-[#d8ff33] active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {actionLoading ? '...' : group.is_member ? 'Leave' : 'Join'}
            </button>
            {user && user.user_id === group.creator_id && (
              <button
                onClick={handleDeleteGroup}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg font-bold font-body text-sm tracking-wide transition-all duration-200 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '...' : 'Delete Group'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#2E2E42] font-body pt-4 border-t border-[#1C1C2E]">
          <button onClick={handleShowMembers} className="hover:text-[#C8FF00] transition-colors" data-testid="show-members-btn">
            👥 {group.member_count || 0} members
          </button>
          <span>📝 {group.post_count || 0} posts</span>
          <span>👤 Created by {group.creator_username || 'Unknown'}</span>
        </div>

        {/* Members list */}
        {showMembers && (
          <div className="mt-4 pt-4 border-t border-[#1C1C2E]">
            <h3 className="text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-3">Members</h3>
            <div className="grid grid-cols-2 gap-2">
              {members.map(m => (
                <a key={m.user_id} href={`/profile/${m.user_id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1C1C2E] transition-colors">
                  <span className="text-xs text-[#F0F0FF] font-body">{m.anonymous_name || m.username}</span>
                  <span className="text-[10px] text-[#C8FF00] capitalize">{m.role}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Section */}
      {canViewPosts ? (
        <>
          {group.is_member && (
            <CreatePostForm groupId={parseInt(id)} onPostCreated={(post) => setNewPost(post)} />
          )}
          <PostList groupId={parseInt(id)} newPost={newPost} />
        </>
      ) : (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-2xl text-[#52526E] tracking-wider mb-2">PRIVATE GROUP</p>
          <p className="text-sm text-[#2E2E42] font-body mb-6">Join this group to view and create posts</p>
          <button
            onClick={handleJoinLeave}
            disabled={actionLoading}
            data-testid="join-private-btn"
            className="px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 disabled:opacity-50 transition-all"
          >
            {actionLoading ? 'Joining...' : 'Join Group'}
          </button>
        </div>
      )}
    </main>
  );
}
