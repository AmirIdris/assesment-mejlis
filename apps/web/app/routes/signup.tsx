import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '~/lib/auth';

export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate({ to: '/dashboard' });
    return null;
  }

  // Validate password according to API requirements
  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '', requirements: [] };
    const errors = validatePassword(pwd);
    const requirements = [
      { met: pwd.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(pwd), text: 'One uppercase letter' },
      { met: /[a-z]/.test(pwd), text: 'One lowercase letter' },
      { met: /[0-9]/.test(pwd), text: 'One number' },
    ];
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { strength: 0, label: 'Weak', color: 'red-500', requirements };
    if (metCount === 1) return { strength: 1, label: 'Weak', color: 'red-500', requirements };
    if (metCount === 2) return { strength: 2, label: 'Fair', color: 'yellow-500', requirements };
    if (metCount === 3) return { strength: 3, label: 'Good', color: 'blue-500', requirements };
    return { strength: 4, label: 'Strong', color: 'green-500', requirements };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password requirements
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="w-full border-b border-solid border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-900">
            <div className="size-8 flex items-center justify-center bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined text-[24px]">grid_view</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">ProManage</h2>
          </div>
          <Link
            to="/login"
            className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="truncate">Log In</span>
          </Link>
          <button className="sm:hidden text-slate-500" type="button">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-[520px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-10 flex flex-col gap-6">
            {/* Heading */}
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-500 text-base">
                Join us to manage your projects efficiently.
              </p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-12 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium"
              >
                <span className="material-symbols-outlined text-xl">language</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-12 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium"
              >
                <span className="material-symbols-outlined text-xl">code</span>
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                Or register with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Field */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-700 text-sm font-medium">Email address</span>
                <div className="relative">
                  <input
                    className="w-full h-12 rounded-lg bg-slate-50 border border-slate-300 px-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                </div>
              </label>

              {/* Password Field */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-700 text-sm font-medium">Password</span>
                <div className="relative">
                  <input
                    className="w-full h-12 rounded-lg bg-slate-50 border border-slate-300 px-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </label>

              {/* Password Strength & Requirements */}
              {password.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">Password Strength</span>
                    {passwordStrength.label && (
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.color === 'red-500'
                            ? 'text-red-500'
                            : passwordStrength.color === 'yellow-500'
                              ? 'text-yellow-500'
                              : passwordStrength.color === 'blue-500'
                                ? 'text-blue-500'
                                : 'text-green-500'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="flex h-1.5 w-full gap-1 rounded bg-slate-100 overflow-hidden">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full w-1/4 rounded ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color === 'red-500'
                              ? 'bg-red-500'
                              : passwordStrength.color === 'yellow-500'
                                ? 'bg-yellow-500'
                                : passwordStrength.color === 'blue-500'
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Password Requirements */}
                  <div className="flex flex-col gap-1.5 text-xs">
                    {passwordStrength.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${req.met ? 'text-green-500' : 'text-slate-400'}`}>
                          {req.met ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={req.met ? 'text-green-600' : 'text-slate-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <label className="flex flex-col gap-2">
                <span className="text-slate-700 text-sm font-medium">Confirm Password</span>
                <div className="relative">
                  <input
                    className="w-full h-12 rounded-lg bg-slate-50 border border-slate-300 px-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Re-enter your password"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </label>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                <input
                  className="mt-1 w-4 h-4 rounded border-slate-300 bg-slate-50 text-primary focus:ring-offset-0 focus:ring-primary/20 cursor-pointer"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-sm text-slate-500 leading-normal group-hover:text-slate-700 transition-colors">
                  I agree to the{' '}
                  <a
                    className="text-primary hover:underline hover:text-primary/80"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    className="text-primary hover:underline hover:text-primary/80"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <button
                className="mt-4 w-full h-12 rounded-lg bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
