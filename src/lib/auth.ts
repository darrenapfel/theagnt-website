import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];

// Only add Resend email provider if API key is configured
if (process.env.AUTH_RESEND_KEY && process.env.AUTH_RESEND_KEY !== 'your_resend_api_key') {
  providers.push(
    Resend({
      from: process.env.EMAIL_FROM || 'noreply@theagnt.ai',
    })
  );
}

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
  providers,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback - session:', session);
      console.log('Session callback - token:', token);
      
      if (session.user) {
        // Use email as the user ID for simplicity
        session.user.id = session.user.email;
        session.user.isAdmin = session.user.email === 'darrenapfel@gmail.com';
      }
      
      console.log('Session callback - final session:', session);
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback - token:', token);
      console.log('JWT callback - user:', user);
      console.log('JWT callback - account:', account);
      
      if (user) {
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
