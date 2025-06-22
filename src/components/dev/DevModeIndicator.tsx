'use client';

interface DevModeIndicatorProps {
  userEmail: string;
}

export default function DevModeIndicator({ userEmail }: DevModeIndicatorProps) {
  const handleSwitchUser = () => {
    // Clear development session cookies
    document.cookie = 'email-session=; Max-Age=0; path=/';
    document.cookie = 'dev-session=; Max-Age=0; path=/';
    
    // Redirect to dev login page
    window.location.href = '/dev/login';
  };

  return (
    <div className="bg-electric-mint/10 border-b border-electric-mint/20 px-4 py-2">
      <div className="text-center text-xs text-electric-mint">
        🔧 Development Mode - Logged in as: {userEmail}
        <button
          onClick={handleSwitchUser}
          className="ml-4 text-electric-mint hover:text-electric-mint/80 underline"
        >
          Switch User
        </button>
      </div>
    </div>
  );
}