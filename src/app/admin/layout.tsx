import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
