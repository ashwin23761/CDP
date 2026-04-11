import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await apiLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await apiRegister(formData);
      }

      if (response.success) {
        login(response.data, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-xl bg-[#C8FF00] flex items-center justify-center text-[#090910] font-display text-2xl">
              C
            </span>
            <div className="text-left">
              <div className="font-display text-3xl tracking-widest text-[#F0F0FF]">
                CDP
              </div>
              <div className="text-[10px] font-mono text-[#52526E]">
                Community Discussion Platform
              </div>
            </div>
          </div>
          <p className="text-sm text-[#52526E] font-body">
            {isLogin ? 'Welcome back!' : 'Join the conversation'}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-[#1C1C2E] bg-[#101018] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
                  placeholder="Choose a username"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-[#52526E] uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0D0D15] border border-[#1C1C2E] text-[#F0F0FF] placeholder-[#2E2E42] focus:outline-none focus:border-[#C8FF00] transition-colors font-body"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-[#C8FF00] text-[#090910] font-bold font-body text-sm tracking-wide hover:bg-[#d8ff33] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-[#52526E] hover:text-[#C8FF00] transition-colors font-body"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#2E2E42] font-body">
          Discuss freely. Stay anonymous. Connect authentically.
        </div>
      </div>
    </div>
  );
}
