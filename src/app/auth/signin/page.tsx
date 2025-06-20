import AuthButton from '@/components/auth/AuthButton';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-thin text-foreground mb-12 animate-[breathe_4s_ease-in-out_infinite]">
            theAGNT.ai
          </h1>
        </div>

        <div className="space-y-4">
          <AuthButton provider="google">Continue with Google</AuthButton>

          <AuthButton provider="apple">Continue with Apple</AuthButton>

          <AuthButton provider="email">Continue with Email</AuthButton>
        </div>
      </div>
    </div>
  );
}
