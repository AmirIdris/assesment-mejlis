import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/lib/auth';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api';
import type { UserResponse, UserUpdateInput, Role } from '@repo/shared-types';

export const Route = createFileRoute('/(protected)/users.$userId.edit-role')({
  component: EditUserRole,
});

function EditUserRole() {
  const { userId } = Route.useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isClient, setIsClient] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('USER');

  // Ensure we're on the client before using router hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ['user', userId],
    queryFn: () => api.users.get(userId),
    enabled: isClient && !!userId && !!currentUser && currentUser.role === 'ADMIN',
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserUpdateInput) => api.users.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      navigate({ to: '/users' });
    },
  });

  useEffect(() => {
    if (!isClient) return;
    if (userData) {
      setSelectedRole(userData.role);
    }
  }, [userData, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      navigate({ to: '/users' });
    }
  }, [currentUser, authLoading, navigate, isClient]);

  const handleSave = () => {
    if (userData && selectedRole !== userData.role) {
      updateUserMutation.mutate({ role: selectedRole });
    }
  };

  const handleCancel = () => {
    navigate({ to: '/users' });
  };

  const getAvatarUrl = (email: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=2b6cee&color=fff&size=128`;
  };

  const getRoleDisplayName = (role: Role) => {
    return role === 'ADMIN' ? 'Administrator' : 'User';
  };

  const getRoleDescription = (role: Role) => {
    if (role === 'ADMIN') {
      return 'Full access to all settings, billing, and user management.';
    }
    return 'Standard user access with limited permissions.';
  };

  const getPermissionsForRole = (role: Role) => {
    if (role === 'ADMIN') {
      return [
        { name: 'User Management', description: 'Create, edit and delete user accounts', allowed: true },
        { name: 'System Settings', description: 'Access to all system configuration', allowed: true },
        { name: 'Billing Access', description: 'View and modify payment methods', allowed: true },
        { name: 'Analytics Dashboard', description: 'Access to all reports and metrics', allowed: true },
      ];
    }
    return [
      { name: 'View Content', description: 'Read-only access to documents and data', allowed: true },
      { name: 'Edit Own Content', description: 'Can modify personal information', allowed: true },
      { name: 'User Management', description: 'Cannot manage other users', allowed: false },
      { name: 'Billing Access', description: 'Cannot view or modify payment methods', allowed: false },
    ];
  };

  if (!isClient || authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'ADMIN' || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-slate-500 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const permissions = getPermissionsForRole(selectedRole);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light text-slate-900 font-display overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-surface-light px-6 py-3 lg:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-slate-900">
            <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Admin Console</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-slate-500 hover:text-primary text-sm font-medium leading-normal transition-colors">
              Dashboard
            </Link>
            <Link to="/users" className="text-primary text-sm font-medium leading-normal">
              Users
            </Link>
            <Link to="/documents" className="text-slate-500 hover:text-primary text-sm font-medium leading-normal transition-colors">
              Documents
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 border border-transparent focus-within:border-primary/50 transition-all">
              <div className="text-slate-400 flex items-center justify-center pl-3">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-transparent text-slate-900 focus:outline-0 focus:ring-0 border-none h-full placeholder:text-slate-400 px-3 text-sm font-normal leading-normal"
                placeholder="Search users..."
                value=""
                readOnly
              />
            </div>
          </label>
          <button
            className="relative bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-transparent hover:ring-primary/50 transition-all"
            data-alt="Admin user profile picture"
            style={{ backgroundImage: `url(${getAvatarUrl(currentUser.email)})` }}
          >
            <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-6 px-4 sm:px-8">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap gap-2 items-center text-sm">
            <Link to="/users" className="text-slate-500 hover:underline">
              Users
            </Link>
            <span className="text-slate-400 material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-500">{userData.email}</span>
            <span className="text-slate-400 material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 font-medium">Edit Role</span>
          </nav>

          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-[32px] font-bold leading-tight text-slate-900 tracking-tight">Edit User Role</h1>
            <p className="text-slate-500 text-base font-normal leading-normal">Manage access levels and permissions for this account.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
            {/* User Profile Summary (Left/Top) */}
            <div className="lg:col-span-12 xl:col-span-12">
              <div className="bg-surface-light rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 ring-4 ring-slate-100"
                    data-alt={`Portrait of ${userData.email}`}
                    style={{ backgroundImage: `url(${getAvatarUrl(userData.email)})` }}
                  ></div>
                  <div className="flex flex-col flex-1 items-center sm:items-start text-center sm:text-left gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">{userData.email}</h3>
                      <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-500/20">
                        Active
                      </span>
                    </div>
                    <p className="text-slate-500">{userData.email}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                      <span>ID: {userData.id.slice(0, 8)}</span>
                      <span
                        className="material-symbols-outlined text-[14px] cursor-pointer hover:text-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(userData.id);
                        }}
                      >
                        content_copy
                      </span>
                    </div>
                  </div>
                  <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Role</span>
                    <span className="px-4 py-1.5 rounded-full bg-blue-100 text-primary font-medium text-sm border border-blue-200">
                      {getRoleDisplayName(userData.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Role Form Area */}
            <div className="lg:col-span-8">
              <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Role Configuration</h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  {/* Role Select */}
                  <label className="flex flex-col gap-2">
                    <span className="text-slate-900 text-sm font-medium">Assign New Role</span>
                    <div className="relative">
                      <select
                        className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-900 text-base rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 pr-10 transition-colors"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                      >
                        <option value="ADMIN">Administrator</option>
                        <option value="USER">User</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Changing the role will update the user's permissions immediately.
                    </p>
                  </label>

                  {/* Permission Preview Area */}
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                      <h4 className="text-sm font-semibold text-slate-900">Permissions for {getRoleDisplayName(selectedRole)}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {permissions.map((permission, index) => (
                        <div key={index} className={`flex items-start gap-3 ${!permission.allowed ? 'opacity-50' : ''}`}>
                          {permission.allowed ? (
                            <span className="material-symbols-outlined text-green-500 text-[20px] mt-0.5">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">cancel</span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800">{permission.name}</span>
                            <span className="text-xs text-slate-500">{permission.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning / Info Box */}
                  <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="material-symbols-outlined text-orange-600 mt-0.5">info</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-orange-800">Security Note</p>
                      <p className="text-sm text-orange-700">
                        If you change the role, the user may be logged out of their current session to apply new permissions securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 p-6 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateUserMutation.isPending || selectedRole === userData.role}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Helper Side Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-light rounded-xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 mb-4">Role Definitions</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-purple-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Administrator</p>
                      <p className="text-xs text-slate-500">Full access to all settings, billing, and user management.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 size-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">User</p>
                      <p className="text-xs text-slate-500">Standard access with limited permissions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

