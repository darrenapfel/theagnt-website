import { NextRequest, NextResponse } from 'next/server';
import { canAccessInternal, getUserAccess, isTheAgntDomain, getUserRole } from '@/lib/domain-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }
  
  const access = getUserAccess(email);
  
  return NextResponse.json({
    email,
    canAccessInternal: canAccessInternal(email),
    isTheAgntDomain: isTheAgntDomain(email),
    role: getUserRole(email),
    fullAccess: access,
    debug: {
      emailType: typeof email,
      emailLength: email.length,
      emailTrimmed: email.trim(),
      domain: email.split('@')[1],
      domainLowercase: email.split('@')[1]?.toLowerCase(),
    }
  });
}