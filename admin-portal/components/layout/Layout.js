import { useState } from 'react';
import { useAuth } from '../../hooks/useApi';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { useRouter } from 'next/router';
import { Button } from '../ui';
import SessionTimeoutModal from '../SessionTimeoutModal';
import { getRoleDisplayName, getRoleColor, PERMISSIONS } from '../../lib/roles';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { checkPermission, userRole } = useRoleAccess();
  const { showWarning, timeLeft, extendSession, logout: sessionLogout } = useSessionTimeout();
  const router = useRouter();

  const allNavigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: '📊', 
      permission: null
    },
    { 
      name: 'Orders', 
      href: '/orders', 
      icon: '📋', 
      permission: PERMISSIONS.VIEW_ORDERS
    },
    { 
      name: 'Stores', 
      href: '/stores', 
      icon: '🏪', 
      permission: PERMISSIONS.VIEW_ORDERS
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: '👥', 
      permission: PERMISSIONS.VIEW_USERS
    },
    { 
      name: 'Measurements', 
      href: '/measurements', 
      icon: '📏', 
      permission: PERMISSIONS.VIEW_INSTALLATIONS
    },
    { 
      name: 'Installations', 
      href: '/installations', 
      icon: '🔧', 
      permission: PERMISSIONS.VIEW_INSTALLATIONS
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: '📈', 
      permission: PERMISSIONS.VIEW_ANALYTICS
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: '⚙️', 
      permission: PERMISSIONS.MANAGE_SETTINGS
    },
  ];

  const navigation = allNavigation.filter(item => 
    !item.permission || checkPermission(item.permission)
  ).map(item => ({
    ...item,
    current: router.pathname === item.href
  }));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
      window.location.href = '/login';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-50">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EA</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900">Elora Art Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </span>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user?.name || 'User'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-gray-200 z-40 hidden md:block overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sm group ${
                        item.current
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md transform scale-105'
                          : 'text-gray-700 hover:bg-blue-50 hover:shadow-sm hover:scale-102'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="font-medium truncate">{item.name}</span>
                      {item.current && (
                        <svg className="ml-auto flex-shrink-0 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* System Status */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>System Status</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="px-4 pb-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sm text-red-600 hover:bg-red-50 hover:shadow-sm mt-2 group"
              >
                <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium truncate">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 md:hidden overflow-hidden transform transition-transform">
              <div className="h-full flex flex-col">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">EA</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        Elora Art Admin
                      </h2>
                      <p className="text-xs text-gray-600">
                        Management Portal
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                  <ul className="space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => {
                            setSidebarOpen(false);
                            router.push(item.href);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sm group ${
                            item.current
                              ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-blue-50 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <span className="font-medium truncate">{item.name}</span>
                          {item.current && (
                            <svg className="ml-auto flex-shrink-0 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile System Status */}
                <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>System Status</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Logout */}
                <div className="px-3 pb-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-sm text-red-600 hover:bg-red-50 hover:shadow-sm mt-2 group"
                  >
                    <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium truncate">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="md:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          <div className="p-4 sm:p-6">
            <div className="max-w-full">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        isOpen={showWarning}
        timeLeft={timeLeft}
        onExtendSession={extendSession}
        onLogout={sessionLogout}
      />

      <style jsx global>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }
        
        .sidebar-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .sidebar-item:hover::before {
          left: 100%;
        }
      `}</style>
    </>
  );
}