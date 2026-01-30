import { useRoleAccess } from '../hooks/useRoleAccess';

export default function ProtectedRoute({ 
  children, 
  permission, 
  permissions, 
  role,
  fallback = null 
}) {
  const { checkPermission, checkAnyPermission, userRole } = useRoleAccess();
  
  // Check specific role
  if (role && userRole !== role) {
    return fallback;
  }
  
  // Check single permission
  if (permission && !checkPermission(permission)) {
    return fallback;
  }
  
  // Check multiple permissions (user needs at least one)
  if (permissions && !checkAnyPermission(permissions)) {
    return fallback;
  }
  
  return children;
}

export function UnauthorizedMessage({ message = "You don't have permission to access this feature." }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}