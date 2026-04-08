// Utility: human-readable relative time (no library needed)
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return "just now";
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Stable color from user_id for the avatar dot
const AVATAR_COLORS = [
  "#C8FF00", "#FF6B6B", "#4ECDC4", "#FFE66D",
  "#A78BFA", "#FB923C", "#34D399", "#F472B6",
];
const avatarColor = (id) => AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];

export default function PostCard({ post }) {
  const { post_id, user_id, title, content, created_at } = post;
  const color = avatarColor(user_id);

  return (
    <article
      className="post-card group relative rounded-xl border border-[#1C1C2E]
                 bg-[#101018] p-5 cursor-pointer
                 hover:border-[#2E2E42] hover:bg-[#13131F]
                 transition-all duration-300 overflow-hidden"
    >
      {/* Left accent stripe — animates in on hover */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />

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

        <div className="flex flex-col leading-tight">
          <span className="text-xs text-[#52526E] font-body">
            Anon · User #{user_id ?? "—"}
          </span>
          <span className="text-[10px] text-[#2E2E42] font-body">
            {created_at ? timeAgo(created_at) : "unknown"}
          </span>
        </div>

        {/* Post ID badge */}
        <span
          className="ml-auto text-[10px] font-mono text-[#2E2E42]
                        border border-[#1C1C2E] rounded px-1.5 py-0.5"
        >
          #{post_id}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display text-2xl tracking-wide text-[#F0F0FF]
                   group-hover:text-[#C8FF00] transition-colors duration-300
                   leading-tight mb-2"
      >
        {title}
      </h3>

      {/* Content preview — clamped to 3 lines */}
      <p
        className="text-sm text-[#52526E] font-body leading-relaxed
                   line-clamp-3"
      >
        {content}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-[#1C1C2E] flex items-center gap-4">
        <span className="text-xs text-[#2E2E42] font-body">
          💬 Comments — Week 2
        </span>
      </div>
    </article>
  );
}
