import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1C1C2E] bg-[#090910]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo-link">
          <span className="w-7 h-7 rounded-md bg-[#C8FF00] flex items-center justify-center text-[#090910] font-display text-base leading-none">
            C
          </span>
          <span className="font-display text-xl tracking-widest text-[#F0F0FF] group-hover:text-[#C8FF00] transition-colors">
            CDP
          </span>
          <span className="text-[10px] font-mono text-[#2E2E42] border border-[#1C1C2E] rounded px-1.5 py-0.5 ml-1">
            CAMPUS
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            data-testid="nav-feed-link"
            className={`text-sm font-body transition-colors ${
              isActive('/') 
                ? 'text-[#C8FF00]' 
                : 'text-[#52526E] hover:text-[#F0F0FF]'
            }`}
          >
            Feed
          </Link>
          <Link
            to="/groups"
            className={`text-sm font-body transition-colors ${
              isActive('/groups') || location.pathname.startsWith('/groups/') 
                ? 'text-[#C8FF00]' 
                : 'text-[#52526E] hover:text-[#F0F0FF]'
            }`}
          >
            Groups
          </Link>
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-xs text-[#52526E] font-body">
              {user?.anonymous_name || 'User'}
            </div>
            <div className="text-[9px] text-[#2E2E42] font-mono">
              @{user?.username}
            </div>
          </div>
          
          <button
            onClick={logout}
            data-testid="nav-logout-button"
            className="px-3 py-1.5 rounded-lg border border-[#1C1C2E] text-[#52526E] hover:text-[#F0F0FF] hover:border-[#C8FF00] transition-all duration-200 text-xs font-body"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
eader>
  );
}
