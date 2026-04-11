import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1C1C2E] bg-[#090910]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" data-testid="nav-logo-link">
          <span className="w-7 h-7 rounded-md bg-[#C8FF00] flex items-center justify-center text-[#090910] font-display text-base leading-none">C</span>
          <span className="font-display text-xl tracking-widest text-[#F0F0FF] hover:text-[#C8FF00] transition-colors">CDP</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 shrink-0">
          <Link to="/" data-testid="nav-feed-link" className={`text-sm font-body transition-colors ${isActive('/') ? 'text-[#C8FF00]' : 'text-[#52526E] hover:text-[#F0F0FF]'}`}>Feed</Link>
          <Link to="/groups" data-testid="nav-groups-link" className={`text-sm font-body transition-colors ${isActive('/groups') || location.pathname.startsWith('/groups/') ? 'text-[#C8FF00]' : 'text-[#52526E] hover:text-[#F0F0FF]'}`}>Groups</Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm" data-testid="nav-search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            data-testid="nav-search-input"
            className="w-full px-3 py-1.5 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body text-sm"
          />
        </form>

        {/* User menu */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to={`/profile/${user?.user_id}`} data-testid="nav-profile-link" className="text-right mr-1 hover:opacity-80 transition-opacity">
            <div className="text-xs text-[#52526E] font-body">{user?.anonymous_name || 'User'}</div>
            <div className="text-[9px] text-[#2E2E42] font-mono">@{user?.username}</div>
          </Link>
          <button onClick={logout} data-testid="nav-logout-button" className="px-3 py-1.5 rounded-lg border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] hover:border-[#C8FF00] transition-all duration-200 text-xs font-body">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
