// Role definitions and permissions
export const ROLES = {
  ADMIN: 'admin',
  ROOKIE: 'rookie', 
  INSTALLATION_BOYS: 'installation_boys',
  MAINTAINER: 'maintainer'
};

export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Order management
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  DELETE_ORDERS: 'delete_orders',
  
  // Installation management
  VIEW_INSTALLATIONS: 'view_installations',
  CREATE_INSTALLATIONS: 'create_installations',
  EDIT_INSTALLATIONS: 'edit_installations',
  DELETE_INSTALLATIONS: 'delete_installations',
  
  // System management
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SYSTEM: 'manage_system',
  
  // Content management
  UPLOAD_CONTENT: 'upload_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.DELETE_ORDERS,
    PERMISSIONS.VIEW_INSTALLATIONS,
    PERMISSIONS.CREATE_INSTALLATIONS,
    PERMISSIONS.EDIT_INSTALLATIONS,
    PERMISSIONS.DELETE_INSTALLATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.UPLOAD_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT
  ],
  
  [ROLES.ROOKIE]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_INSTALLATIONS,
    PERMISSIONS.UPLOAD_CONTENT
  ],
  
  [ROLES.INSTALLATION_BOYS]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_INSTALLATIONS,
    PERMISSIONS.EDIT_INSTALLATIONS,
    PERMISSIONS.UPLOAD_CONTENT
  ],
  
  [ROLES.MAINTAINER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.VIEW_INSTALLATIONS,
    PERMISSIONS.EDIT_INSTALLATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.UPLOAD_CONTENT,
    PERMISSIONS.EDIT_CONTENT
  ]
};

// Helper functions
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions?.length) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.ROOKIE]: 'Rookie',
    [ROLES.INSTALLATION_BOYS]: 'Installation Team',
    [ROLES.MAINTAINER]: 'Maintainer'
  };
  return roleNames[role] || role;
};

export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.ADMIN]: 'bg-red-100 text-red-800',
    [ROLES.ROOKIE]: 'bg-green-100 text-green-800',
    [ROLES.INSTALLATION_BOYS]: 'bg-blue-100 text-blue-800',
    [ROLES.MAINTAINER]: 'bg-purple-100 text-purple-800'
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};