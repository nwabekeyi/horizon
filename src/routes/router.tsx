import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import paths, { rootPaths } from './paths';
import { RootState } from '../store'; // Adjust path to your store

// Lazy-loaded components
const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
const SignIn = lazy(() => import('pages/authentication/SignIn'));
const SignUp = lazy(() => import('pages/authentication/SignUp'));
const ResetPassword = lazy(() => import('pages/authentication/ResetPassword'));
const Page404 = lazy(() => import('pages/errors/Page404'));
const Home = lazy(() => import('pages/landingPage'));
const WithdrawalHistory = lazy(() => import('pages/dashboard/withdrawalHistory'));
const TwoFaVerification = lazy(() => import('pages/authentication/twoFAVerification'));
const Confirm2FAUpdate = lazy(() => import('pages/authentication/confirm2FAUpdate'));

// Dashboard sub-route components
const NFTMarketplace = lazy(() => import('pages/dashboard/NFTMarketplace'));
const ReferralProgram = lazy(() => import('pages/dashboard/referralProgram'));
const Profile = lazy(() => import('pages/dashboard/profile'));
const Investment = lazy(() => import('pages/dashboard/investments/index'));

import PageLoader from 'components/loading/PageLoader';
import Progress from 'components/loading/Progress';

// Wrapper component to pass user from Redux
const TransactionHistoryWrapper = () => {
  const user = useSelector((state: RootState) => state.user.user);
  return <WithdrawalHistory user={user} />;
};

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
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'dashboard', // '/dashboard'
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            path: '', // '/dashboard'
            element: <Dashboard />,
          },
          {
            path: 'nft-marketplace', // '/dashboard/nft-marketplace'
            element: <NFTMarketplace />,
          },
          {
            path: 'transaction-history', // '/dashboard/transaction-history'
            element: <TransactionHistoryWrapper />, // Use wrapper
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
            path: '*', // '/dashboard/*'
            element: <Dashboard />,
          },
        ],
      },
      {
        path: rootPaths.pagesRoot, // '/pages'
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [],
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
          {
            path: paths.twoFA,
            element: <TwoFaVerification />
          },
          {
            path: paths.twoFAUpdate,
            element: <Confirm2FAUpdate />
          },
        ],
      },
      {
        path: '*', // Catch-all
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