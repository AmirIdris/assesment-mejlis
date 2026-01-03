import { renderToString } from 'react-dom/server';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { AuthProvider } from '../lib/auth';

// Create router instance for type declaration
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export async function render(url: string) {
  try {
    // Create a new router instance per request
    const requestRouter = createRouter({ 
      routeTree,
    });
    
    // Navigate to the current URL to initialize the router's store
    // This must be done before rendering to ensure the router context is set up
    await requestRouter.navigate({ to: url });
    
    // Create a new QueryClient for each request (SSR-safe)
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable queries during SSR to avoid hydration mismatches
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    
    const appHtml = renderToString(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={requestRouter} />
        </AuthProvider>
      </QueryClientProvider>
    );
    
    // Wrap in full HTML document - Vinxi will inject client scripts
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Federal Mejlis Assessment</title>
</head>
<body>
  <div id="root">${appHtml}</div>
</body>
</html>`;
    
    return { html };
  } catch (error) {
    // Fallback to basic HTML if SSR fails
    console.error('SSR Error:', error);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Federal Mejlis Assessment</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    return { html };
  }
}

export default async function handler(event: any) {
  try {
    // Get the URL from the request
    const url = new URL(event.request.url);
    const pathname = url.pathname + url.search;
    
    // Create a new router instance per request
    const requestRouter = createRouter({ 
      routeTree,
    });
    
    // Navigate to the current URL to initialize the router's store
    // This must be done before rendering to ensure the router context is set up
    await requestRouter.load({ pathname });
    
    // Create a new QueryClient for each request (SSR-safe)
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable queries during SSR to avoid hydration mismatches
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    
    const appHtml = renderToString(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={requestRouter} />
        </AuthProvider>
      </QueryClientProvider>
    );
    
    // Wrap in full HTML document - Vinxi will inject client scripts
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Federal Mejlis Assessment</title>
</head>
<body>
  <div id="root">${appHtml}</div>
</body>
</html>`;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    // Fallback to basic HTML if SSR fails
    console.error('SSR Error:', error);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Federal Mejlis Assessment</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}

