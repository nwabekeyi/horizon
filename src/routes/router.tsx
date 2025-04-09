import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';

// Lazy-loaded components
const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const Dashboard = lazy(() => import('pages/dashboard/Dashboard')); // Only renders DashboardHome
const SignIn = lazy(() => import('pages/authentication/SignIn'));
const SignUp = lazy(() => import('pages/authentication/SignUp'));
const ResetPassword = lazy(() => import('pages/authentication/ResetPassword'));
const Page404 = lazy(() => import('pages/errors/Page404'));
const Home = lazy(() => import('pages/landingPage'));

// Dashboard sub-route components (lazy-loaded)
const NFTMarketplace = lazy(() => import('pages/dashboard/NFTMarketplace'));
const TransactionHistory = lazy(() => import('pages/dashboard/transaction-history'));
const ReferralProgram = lazy(() => import('pages/dashboard/referralProgram'));
const Profile = lazy(() => import('pages/dashboard/profile'));
const Investment = lazy(() => import('pages/dashboard/investments'));

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
            <Home /> {/* Home is standalone */}
          </Suspense>
        ),
      },
      {
        path: 'dashboard', // '/dashboard'
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet /> {/* Sub-routes will render here */}
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            path: '', // '/dashboard' (exact match)
            element: <Dashboard />, // Renders DashboardHome
          },
          {
            path: 'nft-marketplace', // '/dashboard/nft-marketplace'
            element: <NFTMarketplace />,
          },
          {
            path: 'transaction-history', // '/dashboard/transaction-history'
            element: <TransactionHistory />,
          },
          {
            path: 'referral-program', // '/dashboard/referral-program'
            element: <ReferralProgram />,
          },
          {
            path: 'profile', // '/dashboard/profile'
            element: <Profile />,
          },
          {
            path: 'investment', // '/dashboard/investment'
            element: <Investment />,
          },
          {
            path: '*', // '/dashboard/*' (catch-all for unmatched sub-routes)
            element: <Dashboard />, // Fallback to DashboardHome
          },
        ],
      },
      {
        path: rootPaths.pagesRoot, // '/pages' (optional, for other pages)
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [
          // Add other pages under '/pages' here if needed
        ],
      },
      {
        path: rootPaths.authRoot, // '/authentication'
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuthLayout />
          </Suspense>
        ),
        children: [
          {
            path: paths.signin, // '/authentication/sign-in'
            element: <SignIn />,
          },
          {
            path: paths.signup, // '/authentication/sign-up'
            element: <SignUp />,
          },
          {
            path: paths.resetPassword, // '/authentication/reset-password'
            element: <ResetPassword />,
          },
        ],
      },
      {
        path: '*', // Catch-all for top-level unmatched routes
        element: (
          <Suspense fallback={<PageLoader />}>
            <Page404 />
          </Suspense>
        ),
      },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/' });

export default router;