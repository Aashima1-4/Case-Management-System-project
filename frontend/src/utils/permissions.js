/** Role codes: Ad=Admin, Sso=SSO, SSA, Sa=SA, La=LA */
export const ROLES = {
  ADMIN: 'Admin',
  SSO: 'SSO',
  SSA: 'SSA',
  SA: 'SA',
  LA: 'LA',
  RECEIVING: 'Receiving Department',
  ADMINISTRATION: 'Administration',
};

export const ALL_ROLES = Object.values(ROLES);

export const ROUTE_ACCESS = {
  '/dashboard': [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.SSO, ROLES.LA, ROLES.RECEIVING, ROLES.ADMINISTRATION],
  '/case-tracking': [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.SSO, ROLES.LA, ROLES.RECEIVING, ROLES.ADMINISTRATION],
  '/evidence': [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.SSO],
  '/upload': [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.SSO],
  '/analytics': [ROLES.ADMIN, ROLES.ADMINISTRATION],
};

export const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', roles: ROUTE_ACCESS['/dashboard'] },
  { name: 'Case Tracking', path: '/case-tracking', roles: ROUTE_ACCESS['/case-tracking'] },
  { name: 'Evidence', path: '/evidence', roles: ROUTE_ACCESS['/evidence'] },
  { name: 'Upload', path: '/upload', roles: ROUTE_ACCESS['/upload'] },
  { name: 'Analytics', path: '/analytics', roles: ROUTE_ACCESS['/analytics'] },
];

export const canRegisterCase = (role) =>
  [ROLES.ADMIN, ROLES.RECEIVING, ROLES.LA].includes(role);

export const canEditCase = (role) =>
  [ROLES.ADMIN, ROLES.LA, ROLES.SA, ROLES.SSA, ROLES.SSO].includes(role);

export const canDeleteCase = (role) => role === ROLES.ADMIN;

export const canAllotCase = (role) => role === ROLES.ADMIN;

export const canAssignTeam = (role) => role === ROLES.SSO;

export const isViewOnlyCaseTracking = (role) =>
  [ROLES.RECEIVING, ROLES.ADMINISTRATION].includes(role);

export const SIGNUP_ROLES = [ROLES.SA, ROLES.SSA, ROLES.SSO, ROLES.LA];

export function hasRole(user, allowedRoles) {
  return user && allowedRoles.includes(user.role);
}

export function canAccessRoute(user, path) {
  const roles = ROUTE_ACCESS[path];
  return roles ? hasRole(user, roles) : false;
}
