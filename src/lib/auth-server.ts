import NextAuth from 'next-auth';
import { authConfig } from './auth';

const nextAuth = NextAuth(authConfig);

export const { handlers, auth, signIn, signOut } = nextAuth;
