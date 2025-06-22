import { auth } from '@/lib/auth-server';
import { getUserAccess, getAccessDescription } from '@/lib/domain-utils';
import { redirect } from 'next/navigation';

/**
 * Internal Dashboard Page
 * 
 * This page is protected by middleware.ts and only accessible to:
 * - Users with @theagnt.ai email domain
 * - Admin users (darrenapfel@gmail.com)
 * 
 * The middleware handles the authentication and domain validation,
 * so by the time this component renders, we know the user has access.
 */
export default async function InternalPage() {
  const session = await auth();
  
  // Double-check access (middleware should have handled this)
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }
  
  const userAccess = getUserAccess(session.user.email);
  const accessDescription = getAccessDescription(session.user.email);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Internal Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Restricted access - theAGNT.ai team only
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name || 'Team Member'}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user.email}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {session.user.name?.[0] || session.user.email?.[0] || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Access Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Role</h3>
              <p className="text-green-700 capitalize">{userAccess.role}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Permission Level</h3>
              <p className="text-blue-700 capitalize">{userAccess.permissionLevel}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">Access Description</h3>
              <p className="text-purple-700">{accessDescription}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Capabilities</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${userAccess.canAccessInternal ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Internal Access
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${userAccess.canAccessAdmin ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Admin Access
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Internal Tools */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Internal Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">Waitlist Management</h3>
              <p className="text-sm text-gray-600 mb-3">
                View and manage user waitlist entries
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                View Waitlist
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">User Analytics</h3>
              <p className="text-sm text-gray-600 mb-3">
                View user engagement and metrics
              </p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                View Analytics
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
              <p className="text-sm text-gray-600 mb-3">
                Monitor system health and performance
              </p>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                View Status
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This page is protected by server-side middleware. Access is restricted to theAGNT.ai team members and admin users only.
                All access attempts are logged for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}