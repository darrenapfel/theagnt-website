import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];

// Only add Apple provider if credentials are properly configured
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET && 
    process.env.APPLE_CLIENT_ID !== 'your_apple_client_id' && 
    process.env.APPLE_CLIENT_SECRET !== 'your_apple_client_secret') {
  providers.push({
    id: 'apple',
    name: 'Apple',
    type: 'oauth',
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
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
  });
}

export const authConfig: NextAuthConfig = {
  experimental: {
    enableWebAuthn: false,
  },
  providers,
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
