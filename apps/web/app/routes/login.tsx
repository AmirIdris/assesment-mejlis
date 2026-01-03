import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '~/lib/auth';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate({ to: '/dashboard' });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center items-center gap-3">
          <div className="size-10 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            TechSolutions
          </h2>
        </div>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-[#1c1f27] py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-[#9da6b9]">
              Please enter your details to sign in.
            </p>
          </div>
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6" method="POST">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white pb-2" htmlFor="email">
                Email address
              </label>
              <div className="mt-1">
                <input
                  autoComplete="email"
                  className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#111318] dark:ring-[#3b4354] dark:text-white dark:placeholder:text-[#6b7280] sm:text-sm sm:leading-6"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white pb-2" htmlFor="password">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  autoComplete="current-password"
                  className="block w-full rounded-lg border-0 py-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#111318] dark:ring-[#3b4354] dark:text-white dark:placeholder:text-[#6b7280] sm:text-sm sm:leading-6"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ '--checkbox-tick-svg': "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')" } as React.CSSProperties}>
                <input
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-[#3b4354] dark:bg-[#111318] checked:bg-[image:--checkbox-tick-svg]"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-[#9da6b9]" htmlFor="remember-me">
                  Keep me logged in
                </label>
              </div>
              <div className="text-sm">
                <a className="font-medium text-primary hover:text-blue-500 dark:hover:text-blue-400" href="#">
                  Forgot password?
                </a>
              </div>
            </div>
            {/* Submit Button */}
            <div>
              <button
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          {/* Social / Sign up */}
          <div className="mt-8">
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900 dark:bg-[#1c1f27] dark:text-[#9da6b9]">
                  Don't have an account?
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Link className="text-sm font-bold text-primary hover:text-blue-500 dark:hover:text-blue-400 transition-colors" to="/signup">
                Create an account
              </Link>
            </div>
          </div>
        </div>
        {/* Optional Footer Links */}
        <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-600">
          © 2024 TechSolutions Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}

