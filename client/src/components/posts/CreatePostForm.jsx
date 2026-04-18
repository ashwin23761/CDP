import { useState, useEffect } from "react";
import { createPost } from "../../api/posts";
import { getAllGroups } from "../../api/groups";

export default function CreatePostForm({ groupId, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupId || "");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch groups if not on a specific group page
    if (!groupId) {
      const fetchGroups = async () => {
        try {
          const response = await getAllGroups();
          if (response.success) {
            setGroups(response.data);
            if (response.data.length > 0) {
              setSelectedGroup(response.data[0].group_id);
            }
          }
        } catch (err) {
          console.error('Failed to load groups:', err);
        }
      };
      fetchGroups();
    }
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Both title and content are required.");
      return;
    }

    if (!selectedGroup && !groupId) {
      setError("Please select a group.");
      return;
    }

    setLoading(true);
    try {
      const res = await createPost({
        group_id: groupId || selectedGroup,
        title: title.trim(),
        content: content.trim(),
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      });

      if (res.success) {
        setTitle("");
        setContent("");
        setTagsInput("");
        setOpen(false);
        onPostCreated(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Is the server running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 w-full px-6 py-4 rounded-xl
                     border border-[#1C1C2E] bg-[#101018]
                     hover:border-[#C8FF00] hover:bg-[#13131f]
                     transition-all duration-300 text-left"
        >
          <span
            className="w-8 h-8 rounded-full border border-[#1C1C2E]
                          group-hover:border-[#C8FF00] group-hover:bg-[#C8FF00]
                          flex items-center justify-center
                          text-[#52526E] group-hover:text-[#090910]
                          transition-all duration-300 font-bold text-lg leading-none"
          >
            +
          </span>
          <span className="text-[#52526E] group-hover:text-[#F0F0FF] transition-colors duration-300 font-body">
            Start a new discussion…
          </span>
        </button>
      )}

      {open && (
        <div
          className="rounded-xl border border-[#C8FF00] bg-[#101018] p-6
                        shadow-[0_0_40px_rgba(200,255,0,0.08)]"
          style={{ animation: "fadeUp 0.3s ease forwards" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl tracking-wider text-[#C8FF00]">
              NEW POST
            </h2>
            <button
              onClick={() => { setOpen(false); setError(null); }}
              className="w-8 h-8 rounded-full border border-[#1C1C2E]
                         hover:border-[#C8FF00] hover:text-[#C8FF00]
                         flex items-center justify-center
                         text-[#52526E] transition-all duration-200 text-sm"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Group selection (only if not on a specific group page) */}
            {!groupId && groups.length > 0 && (
              <div>
                <label className="block text-xs font-semibold tracking-widest
                                  text-[#52526E] uppercase mb-2">
                  Select Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg
                             bg-[#0D0D15] border border-[#1C1C2E]
                             text-[#F0F0FF]
                             focus:outline-none focus:border-[#C8FF00]
                             transition-colors duration-200 font-body text-base"
                >
                  {groups.map((group) => (
                    <option key={group.group_id} value={group.group_id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold tracking-widest
                                text-[#52526E] uppercase mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg
                           bg-[#0D0D15] border border-[#1C1C2E]
                           text-[#F0F0FF] placeholder-[#2E2E42]
                           focus:outline-none focus:border-[#C8FF00]
                           transition-colors duration-200 font-body text-base"
              />
              <p className="text-right text-xs text-[#2E2E42] mt-1">
                {title.length}/255
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold tracking-widest
                                text-[#52526E] uppercase mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or opinions…"
                rows={5}
                className="w-full px-4 py-3 rounded-lg
                           bg-[#0D0D15] border border-[#1C1C2E]
                           text-[#F0F0FF] placeholder-[#2E2E42]
                           focus:outline-none focus:border-[#C8FF00]
                           transition-colors duration-200 font-body text-base"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold tracking-widest
                                text-[#52526E] uppercase mb-2">
                Tags <span className="text-[#2E2E42] normal-case">(comma separated, optional)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. campus, tech, help"
                data-testid="create-post-tags-input"
                className="w-full px-4 py-3 rounded-lg
                           bg-[#0D0D15] border border-[#1C1C2E]
                           text-[#F0F0FF] placeholder-[#2E2E42]
                           focus:outline-none focus:border-[#C8FF00]
                           transition-colors duration-200 font-body text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20
                            border border-red-800 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="px-5 py-2.5 rounded-lg border border-[#1C1C2E]
                           text-[#52526E] hover:text-[#F0F0FF]
                           hover:border-[#2E2E42] transition-all duration-200
                           font-body text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#C8FF00] text-[#090910]
                           font-bold font-body text-sm tracking-wide
                           hover:bg-[#d8ff33] active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                {loading ? "Posting…" : "Post It"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
