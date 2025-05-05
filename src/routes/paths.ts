export const rootPaths = {
  root: '/',
  pagesRoot: 'pages',
  authRoot: 'authentication',
};

export default {
  twoFAUpdate: `/${rootPaths.authRoot}/2FAUpdate`,
  twoFA: `/${rootPaths.authRoot}/2FAverification`,
  signin: `/${rootPaths.authRoot}/sign-in`,   // /authentication/sign-in
  signup: `/${rootPaths.authRoot}/sign-up`,   // /authentication/sign-up
  resetPassword: `/${rootPaths.authRoot}/reset-password`, // /authentication/reset-password
  dashboard: '/dashboard', // Updated to top-level '/dashboard'
};