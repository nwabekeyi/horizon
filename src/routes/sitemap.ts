import paths from './paths';

export interface SubMenuItem {
  subheader: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: number | string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 1,
    subheader: 'Dashboard',
    path: paths.dashboard, // Now '/dashboard'
    icon: 'ic:round-home',
    active: true,
  },
  {
    id: 2,
    subheader: 'NFT Marketplace',
    path: `${paths.dashboard}/nft-marketplace`, // Now '/dashboard/nft-marketplace'
    icon: 'ic:outline-shopping-cart',
  },
  {
    id: 3,
    subheader: 'Transaction History',
    path: `${paths.dashboard}/transaction-history`, // Now '/dashboard/transaction-history'
    icon: 'ic:round-history',
  },
  {
    id: 4,
    subheader: 'Referral Program',
    path: `${paths.dashboard}/referral-program`, // Now '/dashboard/referral-program'
    icon: 'ic:round-gift',
  },
  {
    id: 5,
    subheader: 'Profile',
    path: `${paths.dashboard}/profile`, // Now '/dashboard/profile'
    icon: 'ic:baseline-person',
  },
  {
    id: 6,
    subheader: 'Investments',
    path: `${paths.dashboard}/investment`, // Now '/dashboard/investment'
    icon: 'ic:round-lock',
    active: true,
  },
];

export default sitemap;