import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, updateProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/posts/PostCard';

const AVATAR_COLORS = ["#C8FF00","#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#FB923C","#34D399","#F472B6"];

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const isOwnProfile = currentUser?.user_id === parseInt(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile(userId);
        if (res.success) {
          setProfile(res.data);
          setBio(res.data.bio || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await updateProfile({ bio });
      if (res.success) {
        setProfile(prev => ({ ...prev, bio }));
        setEditingBio(false);
      }
    } catch (err) { console.error('Failed to save bio:', err); }
    finally { setSavingBio(false); }
  };

  if (loading) {
    return (
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-[#52526E]">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-red-400">User not found</div>
      </main>
    );
  }

  const color = profile.avatar_color || AVATAR_COLORS[(profile.user_id ?? 0) % AVATAR_COLORS.length];

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-6 mb-8" data-testid="profile-header">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-[#090910] text-2xl font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            {profile.anonymous_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl tracking-wider text-[#F0F0FF] mb-1">
              {profile.anonymous_name}
            </h1>
            <p className="text-xs text-[#2E2E42] font-mono mb-3">
              @{profile.username} · Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>

            {/* Bio */}
            {editingBio ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  data-testid="edit-bio-input"
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#0D0D15] border border-[#C8FF00] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none font-body"
                  maxLength={200}
                />
                <button onClick={handleSaveBio} disabled={savingBio} data-testid="save-bio-btn" className="px-3 py-2 rounded-lg bg-[#C8FF00] text-[#090910] font-bold text-xs hover:bg-[#d8ff33] disabled:opacity-50 transition-all font-body">
                  {savingBio ? '...' : 'Save'}
                </button>
                <button onClick={() => setEditingBio(false)} className="px-3 py-2 rounded-lg border border-[#1C1C2E] text-[#52526E] text-xs font-body">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#52526E] font-body">
                  {profile.bio || (isOwnProfile ? 'Click edit to add a bio' : 'No bio yet')}
                </p>
                {isOwnProfile && (
                  <button onClick={() => setEditingBio(true)} data-testid="edit-bio-btn" className="text-xs text-[#C8FF00] hover:underline font-body">Edit</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-[#1C1C2E] grid grid-cols-4 gap-4">
          <div className="text-center" data-testid="stat-posts">
            <div className="text-xl font-bold text-[#F0F0FF]">{profile.stats.total_posts}</div>
            <div className="text-xs text-[#52526E] font-body">Posts</div>
          </div>
          <div className="text-center" data-testid="stat-comments">
            <div className="text-xl font-bold text-[#F0F0FF]">{profile.stats.total_comments}</div>
            <div className="text-xs text-[#52526E] font-body">Comments</div>
          </div>
          <div className="text-center" data-testid="stat-groups">
            <div className="text-xl font-bold text-[#F0F0FF]">{profile.stats.total_groups}</div>
            <div className="text-xs text-[#52526E] font-body">Groups</div>
          </div>
          <div className="text-center" data-testid="stat-karma">
            <div className={`text-xl font-bold ${profile.stats.karma >= 0 ? 'text-[#C8FF00]' : 'text-red-400'}`}>{profile.stats.karma}</div>
            <div className="text-xs text-[#52526E] font-body">Karma</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[#1C1C2E] pb-2">
        <button
          onClick={() => setTab('posts')}
          data-testid="tab-posts"
          className={`text-sm font-body pb-2 transition-colors ${tab === 'posts' ? 'text-[#C8FF00] border-b-2 border-[#C8FF00]' : 'text-[#52526E] hover:text-[#F0F0FF]'}`}
        >
          Posts ({profile.posts.length})
        </button>
        <button
          onClick={() => setTab('groups')}
          data-testid="tab-groups"
          className={`text-sm font-body pb-2 transition-colors ${tab === 'groups' ? 'text-[#C8FF00] border-b-2 border-[#C8FF00]' : 'text-[#52526E] hover:text-[#F0F0FF]'}`}
        >
          Groups ({profile.groups.length})
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'posts' && (
        <div className="space-y-4">
          {profile.posts.length === 0 ? (
            <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
              <p className="text-sm text-[#2E2E42] font-body">No posts yet</p>
            </div>
          ) : (
            profile.posts.map((post) => (
              <PostCard key={post.post_id} post={{ ...post, anonymous_name: profile.anonymous_name }} />
            ))
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div className="space-y-3">
          {profile.groups.length === 0 ? (
            <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
              <p className="text-sm text-[#2E2E42] font-body">Not in any groups</p>
            </div>
          ) : (
            profile.groups.map((group) => (
              <a key={group.group_id} href={`/groups/${group.group_id}`} className="block rounded-xl border border-[#1C1C2E] bg-[#101018] p-4 hover:border-[#2E2E42] hover:bg-[#13131F] transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg tracking-wide text-[#F0F0FF]">{group.name}</h3>
                    <p className="text-xs text-[#2E2E42] font-body">{group.description}</p>
                  </div>
                  <span className="text-xs text-[#C8FF00] border border-[#C8FF00] rounded px-2 py-1 capitalize">{group.role}</span>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </main>
  );
}
