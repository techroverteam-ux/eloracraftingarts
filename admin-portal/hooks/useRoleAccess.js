import { useAuth } from './useApi';
import { hasPermission, hasAnyPermission, PERMISSIONS, ROLES } from '../lib/roles';

export function useRoleAccess() {
  const { user } = useAuth();
  
  const userRole = user?.role;
  
  const checkPermission = (permission) => {
    return hasPermission(userRole, permission);
  };
  
  const checkAnyPermission = (permissions) => {
    return hasAnyPermission(userRole, permissions);
  };
  
  const isAdmin = () => userRole === ROLES.ADMIN;
  const isRookie = () => userRole === ROLES.ROOKIE;
  const isInstallationBoy = () => userRole === ROLES.INSTALLATION_BOYS;
  const isMaintainer = () => userRole === ROLES.MAINTAINER;
  
  return {
    userRole,
    checkPermission,
    checkAnyPermission,
    isAdmin,
    isRookie,
    isInstallationBoy,
    isMaintainer,
    
    // Common permission checks
    canViewUsers: () => checkPermission(PERMISSIONS.VIEW_USERS),
    canManageUsers: () => checkAnyPermission([PERMISSIONS.CREATE_USERS, PERMISSIONS.EDIT_USERS, PERMISSIONS.DELETE_USERS]),
    canViewOrders: () => checkPermission(PERMISSIONS.VIEW_ORDERS),
    canManageOrders: () => checkAnyPermission([PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS, PERMISSIONS.DELETE_ORDERS]),
    canViewInstallations: () => checkPermission(PERMISSIONS.VIEW_INSTALLATIONS),
    canManageInstallations: () => checkAnyPermission([PERMISSIONS.CREATE_INSTALLATIONS, PERMISSIONS.EDIT_INSTALLATIONS, PERMISSIONS.DELETE_INSTALLATIONS]),
    canViewAnalytics: () => checkPermission(PERMISSIONS.VIEW_ANALYTICS),
    canManageSettings: () => checkPermission(PERMISSIONS.MANAGE_SETTINGS),
    canUploadContent: () => checkPermission(PERMISSIONS.UPLOAD_CONTENT),
    canManageContent: () => checkAnyPermission([PERMISSIONS.EDIT_CONTENT, PERMISSIONS.DELETE_CONTENT])
  };
}