import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import '../globals.css';

function RootComponent() {
  useEffect(() => {
    // Add font links to document head if they don't already exist
    const addLinkIfNotExists = (href: string, rel: string, crossOrigin?: string) => {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.href = href;
        link.rel = rel;
        if (crossOrigin) {
          link.crossOrigin = crossOrigin;
        }
        document.head.appendChild(link);
      }
    };

    addLinkIfNotExists('https://fonts.googleapis.com', 'preconnect');
    addLinkIfNotExists('https://fonts.gstatic.com', 'preconnect', 'anonymous');
    addLinkIfNotExists(
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      'stylesheet'
    );
    addLinkIfNotExists(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'stylesheet'
    );
  }, []);

  return (
    <div className="min-h-screen bg-background-light font-display text-slate-900 antialiased">
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

