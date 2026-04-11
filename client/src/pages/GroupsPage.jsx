import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllGroups, createGroup } from '../api/groups';

function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await createGroup(formData);
      if (response.success) {
        onSuccess(response.data);
        setFormData({ name: '', description: '', is_private: false });
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg rounded-xl border border-[#C8FF00] bg-[#101018] p-6 shadow-[0_0_40px_rgba(200,255,0,0.08)]"
        style={{ animation: 'fadeUp 0.3s ease forwards' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl tracking-wider text-[#C8FF00]">
            NEW GROUP
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1C1C2E] hover:border-[#C8FF00] hover:text-[#C8FF00] flex items-center justify-center text-[#52526E] transition-all duration-200 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
              placeholder="What's your group about?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
              placeholder="Describe what this group is for..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              className="w-4 h-4 rounded border-[#1C1C2E] bg-[#0D0D15] text-[#C8FF00] focus:ring-[#C8FF00]"
            />
            <label htmlFor="is_private" className="text-sm text-[#52526E] font-body">
              Make this group private
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] hover:border-[#2E2E42] transition-all duration-200 font-body text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGroups = async () => {
    try {
      const response = await getAllGroups();
      if (response.success) {
        setGroups(response.data);
      }
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  if (loading) {
    return (
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="text-center text-[#52526E]">Loading groups...</div>
      </main>
    );
  }

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-6xl tracking-wider text-[#F0F0FF] leading-none">
            GROUPS
          </h1>
          <p className="text-sm text-[#52526E] font-body mt-2">
            Discover and join communities
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 transition-all duration-200"
        >
          + Create Group
        </button>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-12 text-center">
          <p className="font-display text-4xl text-[#1C1C2E] tracking-wider mb-2">
            NO GROUPS YET
          </p>
          <p className="text-sm text-[#2E2E42] font-body mb-6">
            Be the first to create a community
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] transition-all"
          >
            Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link
              key={group.group_id}
              to={`/groups/${group.group_id}`}
              className="group rounded-xl border border-[#1C1C2E] bg-[#101018] p-5 hover:border-[#2E2E42] hover:bg-[#13131F] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-display text-xl tracking-wide text-[#F0F0FF] group-hover:text-[#C8FF00] transition-colors mb-1">
                    {group.name}
                  </h3>
                  <p className="text-xs text-[#2E2E42] font-body">
                    by {group.creator_username || 'Unknown'}
                  </p>
                </div>
                {group.is_private === 1 && (
                  <span className="text-xs text-[#C8FF00] border border-[#C8FF00] rounded px-2 py-1">
                    Private
                  </span>
                )}
              </div>

              <p className="text-sm text-[#52526E] font-body line-clamp-2 mb-4">
                {group.description || 'No description'}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#2E2E42] font-body">
                <span>👥 {group.member_count || 0} members</span>
                <span>📝 {group.post_count || 0} posts</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGroupCreated}
      />
    </main>
  );
}
