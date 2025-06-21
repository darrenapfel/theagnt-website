import Link from 'next/link';

interface AuthErrorProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthError({ searchParams }: AuthErrorProps) {
  const params = await searchParams;
  const error = params.error;
  
  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'Configuration':
        return 'Server configuration error. Please try again later.';
      case 'AccessDenied':
        return 'Access denied. Please check your permissions.';
      case 'Verification':
        return 'Email verification failed. Please try again.';
      case 'OAuthSignin':
        return 'OAuth sign-in error. Please try again.';
      case 'OAuthCallback':
        return 'OAuth callback error. Please check your configuration.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create email account. Please try again.';
      case 'Callback':
        return 'Callback error. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'OAuth account not linked. Please try a different sign-in method.';
      case 'EmailSignin':
        return 'Email sign-in error. Please check your email.';
      case 'CredentialsSignin':
        return 'Credentials sign-in error. Please check your credentials.';
      case 'SessionRequired':
        return 'Session required. Please sign in.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <h1 className="text-6xl font-thin text-foreground mb-12">theAGNT.ai</h1>

        <div className="space-y-4">
          <p className="text-error text-base">{getErrorMessage(error)}</p>
          {error && (
            <p className="text-foreground/60 text-sm">Error code: {error}</p>
          )}

          <Link
            href="/auth/signin"
            className="inline-block w-full h-12 border border-charcoal bg-transparent text-foreground font-medium text-base hover:bg-charcoal transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal focus:ring-offset-background flex items-center justify-center"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}
