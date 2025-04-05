import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';

// Lazy-loaded components
const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
const SignIn = lazy(() => import('pages/authentication/SignIn'));
const SignUp = lazy(() => import('pages/authentication/SignUp'));
const ResetPassword = lazy(() => import('pages/authentication/ResetPassword')); // Import ResetPassword
const Page404 = lazy(() => import('pages/errors/Page404'));
const Home = lazy(() => import('pages/landingPage')); // Home as standalone entry point

import PageLoader from 'components/loading/PageLoader';
import Progress from 'components/loading/Progress';

export const routes = [
  {
    element: (
      <Suspense fallback={<Progress />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: rootPaths.root, // '/'
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home /> {/* Home is standalone, not under Outlet */}
          </Suspense>
        ),
      },
      {
        path: rootPaths.pagesRoot, // '/pages'
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet /> {/* Other pages like Dashboard under MainLayout */}
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            path: 'dashboard/*', // '/pages/dashboard/*'
            element: <Dashboard />,
          },
        ],
      },
      {
        path: rootPaths.authRoot, // '/authentication'
        element: <AuthLayout />,
        children: [
          {
            path: paths.signin, // 'sign-in' -> '/authentication/sign-in'
            element: <SignIn />,
          },
          {
            path: paths.signup, // 'sign-up' -> '/authentication/sign-up'
            element: <SignUp />,
          },
          {
            path: paths.resetPassword, // 'reset-password' -> '/authentication/reset-password'
            element: <ResetPassword />,
          },
        ],
      },
      {
        path: '*', // Catch-all for 404
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/' });

export default router;
