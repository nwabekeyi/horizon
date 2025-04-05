export const rootPaths = {
  root: '/',
  pagesRoot: 'pages',
  authRoot: 'authentication',
};

export default {
  signin: `/${rootPaths.authRoot}/sign-in`,   // /authentication/sign-in
  signup: `/${rootPaths.authRoot}/sign-up`,   // /authentication/sign-up
  resetPassword: `/${rootPaths.authRoot}/reset-password`, // /authentication/reset-password
  dashboard: `/${rootPaths.pagesRoot}/dashboard`, // /pages/dashboard
};
