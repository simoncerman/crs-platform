import { signOut } from 'next-auth/react';

/**
 * Wrapper around fetch for admin API calls.
 * Automatically handles 401 responses by signing out and redirecting to login.
 */
export async function adminFetch(
  url: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<Response> {
  const { accessToken, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    const message = data.error || 'Neplatná session';

    // Sign out and redirect to login with error message
    await signOut({ redirect: false });
    window.location.href = `/admin/login?error=${encodeURIComponent(message)}`;

    // Throw to prevent further processing in the calling code
    throw new Error(message);
  }

  return response;
}
