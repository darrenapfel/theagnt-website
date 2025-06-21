import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
import { supabaseAdmin } from './supabase';

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // Custom credentials provider for Supabase magic link authentication
  Credentials({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      accessToken: { label: 'Access Token', type: 'text' },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.accessToken) {
          console.error('❌ Missing credentials');
          return null;
        }

        console.log('🔐 Authorizing user:', credentials.email);

        // Verify the access token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(credentials.accessToken as string);

        if (error || !user) {
          console.error('❌ Invalid access token:', error);
          return null;
        }

        if (user.email !== credentials.email) {
          console.error('❌ Email mismatch');
          return null;
        }

        console.log('✅ User authorized successfully:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
          image: user.user_metadata?.avatar_url || null,
        };
      } catch (error) {
        console.error('❌ Authorization error:', error);
        return null;
      }
    },
  }),
];

// Only add Apple provider if credentials are properly configured
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET && 
    process.env.APPLE_CLIENT_ID !== 'your_apple_client_id' && 
    process.env.APPLE_CLIENT_SECRET !== 'your_apple_client_secret') {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const authConfig: NextAuthConfig = {
  // Temporarily disable database adapter for testing
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_KEY!,
  // }),
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
