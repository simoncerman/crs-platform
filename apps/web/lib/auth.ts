import NextAuth, { User, Session, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
  interface User {
    role?: string;
    accessToken?: string;
  }
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}

// Use internal Docker network URL for server-side requests, public URL for client-side
const API_URL = typeof window === 'undefined' 
  ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        try {
          console.log('[AUTH] Attempting login for:', credentials.email);
          console.log('[AUTH] API URL:', `${API_URL}/api/auth/login`);
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            cache: 'no-store',
          });

          console.log('[AUTH] Response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[AUTH] Login failed:', errorText);
            return null;
          }

          const data: LoginResponse = await response.json();
          console.log('[AUTH] Login successful for:', data.user.email);

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch (error) {
          console.error('[AUTH] Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('[AUTH] JWT callback - trigger:', trigger);
      if (user) {
        console.log('[AUTH] Adding user to token:', user.email);
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      console.log('[AUTH] Session callback for:', token.email);
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV !== 'production',
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
});
