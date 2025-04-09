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
    path: paths.dashboard,
    icon: 'ic:round-dashboard',
    active: true,
  },

  {
    id: 2,
    subheader: 'Profile',
    path: `${paths.dashboard}/profile`,
    icon: 'ic:baseline-person',
  },
  {
    id: 3,
    subheader: 'Investments',
    path: `${paths.dashboard}/investment`,
    icon: 'ic:baseline-trending-up', // Replaced 'lock' with a more relevant investment icon
    active: true,
  },
  {
    id: 4,
    subheader: 'NFT Marketplace',
    path: `${paths.dashboard}/nft-marketplace`,
    icon: 'ic:baseline-shopping-cart',
  },
  {
    id: 5,
    subheader: 'Transaction History',
    path: `${paths.dashboard}/transaction-history`,
    icon: 'ic:round-history',
  },
  {
    id: 6,
    subheader: 'Referral Program',
    path: `${paths.dashboard}/referral-program`,
    icon: 'ic:baseline-card-giftcard',
  },
];


export default sitemap;