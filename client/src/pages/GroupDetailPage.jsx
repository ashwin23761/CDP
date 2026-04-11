import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupById, joinGroup, leaveGroup, getGroupMembers } from '../api/groups';
import { useAuth } from '../context/AuthContext';
import CreatePostForm from '../components/posts/CreatePostForm';
import PostList from '../components/posts/PostList';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newPost, setNewPost] = useState(null);

  const fetchGroup = async () => {
    try {
      const [groupRes, membersRes] = await Promise.all([
        getGroupById(id),
        getGroupMembers(id)
      ]);

      if (groupRes.success) {
        setGroup(groupRes.data);
      }

      if (membersRes.success) {
        setMembers(membersRes.data);
        setIsMember(membersRes.data.some(m => m.user_id === user?.user_id));
      }
    } catch (err) {
      console.error('Failed to load group:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const handleJoinLeave = async () => {
    setActionLoading(true);
    try {
      if (isMember) {
        await leaveGroup(id);
        setIsMember(false);
        setMembers(members.filter(m => m.user_id !== user?.user_id));
      } else {
        await joinGroup(id);
        setIsMember(true);
        fetchGroup(); // Refresh to get updated member list
      }
    } catch (err) {
      console.error('Failed to join/leave group:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-[#52526E]">Loading group...</div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-red-400">Group not found</div>
      </main>
    );
  }

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      {/* Group Header */}
      <div className="mb-10 rounded-xl border border-[#1C1C2E] bg-[#101018] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl tracking-wider text-[#F0F0FF] leading-none">
                {group.name}
              </h1>
              {group.is_private === 1 && (
                <span className="text-xs text-[#C8FF00] border border-[#C8FF00] rounded px-2 py-1">
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-[#52526E] font-body">
              {group.description || 'No description'}
            </p>
          </div>

          <button
            onClick={handleJoinLeave}
            disabled={actionLoading}
            className={`px-6 py-2.5 rounded-lg font-bold font-body text-sm tracking-wide transition-all duration-200 ${
              isMember
                ? 'border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] hover:border-[#2E2E42]'
                : 'bg-[#C8FF00] text-[#090910] hover:bg-[#d8ff33] active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {actionLoading ? '...' : isMember ? 'Leave' : 'Join'}
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#2E2E42] font-body pt-4 border-t border-[#1C1C2E]">
          <span>👥 {group.member_count || 0} members</span>
          <span>📝 {group.post_count || 0} posts</span>
          <span>👤 Created by {group.creator_username || 'Unknown'}</span>
        </div>
      </div>

      {/* Posts Section */}
      {isMember ? (
        <>
          <CreatePostForm 
            groupId={parseInt(id)} 
            onPostCreated={(post) => setNewPost(post)} 
          />
          <PostList groupId={parseInt(id)} newPost={newPost} />
        </>
      ) : (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-2xl text-[#52526E] tracking-wider mb-2">
            JOIN TO SEE POSTS
          </p>
          <p className="text-sm text-[#2E2E42] font-body mb-6">
            You need to be a member to view and create posts in this group
          </p>
          <button
            onClick={handleJoinLeave}
            disabled={actionLoading}
            className="px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 disabled:opacity-50 transition-all"
          >
            {actionLoading ? 'Joining...' : 'Join Group'}
          </button>
        </div>
      )}
    </main>
  );
}
