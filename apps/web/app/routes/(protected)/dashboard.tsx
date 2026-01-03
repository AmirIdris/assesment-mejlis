import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/lib/auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/(protected)/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        <p className="text-lg">Welcome, {user.email}!</p>
        <p className="text-sm text-muted-foreground mt-2">Role: {user.role}</p>
      </div>
    </div>
  );
}

