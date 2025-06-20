import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <h1 className="text-6xl font-thin text-foreground mb-12">theAGNT.ai</h1>

        <div className="space-y-4">
          <p className="text-error text-base">Authentication failed</p>

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
