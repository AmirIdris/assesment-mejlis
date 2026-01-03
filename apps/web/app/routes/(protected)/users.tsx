import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/lib/auth';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api';
import type { UserListResponse, UserResponse, UserUpdateInput, Role } from '@repo/shared-types';

export const Route = createFileRoute('/(protected)/users')({
  component: Users,
});

function Users() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Ensure we're on the client before using router hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, isClient]);

  const limit = 10;

  useEffect(() => {
    if (!isClient) return;
    if (!authLoading && !user) {
      navigate({ to: '/login' });
    }
  }, [user, authLoading, navigate, isClient]);

  // Fetch users - only on client side
  const { data, isLoading, error } = useQuery<UserListResponse>({
    queryKey: ['users', page, limit, roleFilter, search],
    queryFn: () => api.users.list({ page, limit, role: roleFilter || undefined, search: search || undefined }),
    enabled: isClient && !!user && user.role === 'ADMIN',
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateInput }) => api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEdit = (user: UserResponse) => {
    navigate({ to: '/users/$userId/edit-role', params: { userId: user.id } });
  };


  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
    return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'month' : 'months'} ago`;
  };

  const getRoleBadgeClass = (role: Role) => {
    if (role === 'ADMIN') {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const getAvatarUrl = (email: string) => {
    // Generate a simple avatar based on email
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=2b6cee&color=fff&size=128`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="flex h-full w-72 flex-col bg-white dark:bg-[#111318] border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            {/* User Profile Snippet in Sidebar */}
            <div className="flex items-center gap-3 px-2">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
                style={{ backgroundImage: `url(${getAvatarUrl(user.email)})` }}
              />
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Admin Panel</h1>
                <p className="text-slate-500 dark:text-[#9da6b9] text-xs font-normal">v2.4.0</p>
              </div>
            </div>
            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1f27] transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 dark:text-[#9da6b9] group-hover:text-primary transition-colors">
                  dashboard
                </span>
                <p className="text-slate-600 dark:text-[#9da6b9] text-sm font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white">
                  Dashboard
                </p>
              </Link>
              {/* Active Link */}
              <Link
                to="/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 dark:bg-[#282e39] border border-transparent dark:border-primary/20"
              >
                <span className="material-symbols-outlined text-primary dark:text-white fill-1">group</span>
                <p className="text-primary dark:text-white text-sm font-semibold leading-normal">Users</p>
              </Link>
              <Link
                to="/documents"
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1f27] transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 dark:text-[#9da6b9] group-hover:text-primary transition-colors">
                  description
                </span>
                <p className="text-slate-600 dark:text-[#9da6b9] text-sm font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white">
                  Documents
                </p>
              </Link>
            </div>
          </div>
          {/* Bottom Actions */}
          <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={async () => {
                await logout();
                navigate({ to: '/login' });
              }}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500 dark:text-[#9da6b9] group-hover:text-red-500 transition-colors">
                logout
              </span>
              <p className="text-slate-600 dark:text-[#9da6b9] text-sm font-medium leading-normal group-hover:text-red-500">
                Log Out
              </p>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Section */}
        <div className="flex-none p-6 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111318]/50 backdrop-blur-sm z-10">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-[#9da6b9]">
              <Link to="/dashboard" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-900 dark:text-white">Users</span>
            </nav>
            {/* Page Title & Primary Action */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h2>
                <p className="text-slate-500 dark:text-[#9da6b9]">
                  Manage system access, roles, and status for all registered accounts.
                </p>
              </div>
            </div>
            {/* Toolbar: Search & Filters */}
            <div className="flex flex-wrap items-center gap-4 py-2 mt-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[280px] max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 material-symbols-outlined">
                  search
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  placeholder="Search by email..."
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    className="appearance-none h-11 pl-4 pr-10 rounded-lg bg-white dark:bg-[#1c1f27] border border-slate-200 dark:border-[#3b4354] text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer min-w-[140px]"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined pointer-events-none text-xl">
                    arrow_drop_down
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-[1400px] mx-auto w-full">
            {/* Table Container */}
            {error ? (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-6">
                <p className="text-red-600 dark:text-red-400">Error loading users: {error.message}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#111318] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1c1f27] border-b border-slate-200 dark:border-[#3b4354]">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#282e39]">
                      {data?.users.map((user) => (
                        <tr
                          key={user.id}
                          className="group hover:bg-slate-50 dark:hover:bg-[#1c1f27] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-1 ring-slate-200 dark:ring-slate-700"
                                style={{ backgroundImage: `url(${getAvatarUrl(user.email)})` }}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {user.email}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-[#9da6b9]">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(
                                user.role,
                              )}`}
                            >
                              {user.role === 'ADMIN' && (
                                <span className="material-symbols-outlined text-[14px] fill-1">verified_user</span>
                              )}
                              {user.role === 'ADMIN' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500 dark:text-[#9da6b9]">
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                                disabled={deleteUserMutation.isPending}
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {data && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#111318]">
                    <p className="text-sm text-slate-500 dark:text-[#9da6b9]">
                      Showing <span className="font-medium text-slate-900 dark:text-white">
                        {(data.page - 1) * data.limit + 1}
                      </span>{' '}
                      to <span className="font-medium text-slate-900 dark:text-white">
                        {Math.min(data.page * data.limit, data.total)}
                      </span>{' '}
                      of <span className="font-medium text-slate-900 dark:text-white">{data.total}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!data || page >= data.totalPages}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1c1f27] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}

