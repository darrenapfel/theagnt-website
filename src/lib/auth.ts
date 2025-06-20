import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export const authConfig: NextAuthConfig = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_KEY!,
  }),
  experimental: {
    enableWebAuthn: false,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    {
      id: 'apple',
      name: 'Apple',
      type: 'oauth',
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        url: 'https://appleid.apple.com/auth/authorize',
        params: {
          scope: 'name email',
          response_mode: 'form_post',
        },
      },
      token: 'https://appleid.apple.com/auth/token',
      userinfo: {
        url: 'https://appleid.apple.com/auth/userinfo',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile(profile: any) {
        return {
          id: profile.sub as string,
          name: profile.name as string,
          email: profile.email as string,
          image: null,
        };
      },
    },
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.isAdmin = user.email === 'darrenapfel@gmail.com';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user.email || '') === 'darrenapfel@gmail.com';
      }
      return token;
    },
  },
  trustHost: true,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    isAdmin?: boolean;
  }
}
