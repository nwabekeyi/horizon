import { useState, PropsWithChildren } from 'react';
import Stack from '@mui/material/Stack';
import Sidebar from 'layouts/main-layout/sidebar';
import Topbar from './topbar';
import Footer from './footer';

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  return (
    <Stack width={1} minHeight="calc(100vh - 162px)">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} setIsClosing={setIsClosing} />
      <Stack
        component="main"
        direction="column"
        px={3.5}
        flexGrow={1}
        width={{ xs: 1, lg: 'calc(100% - 290px)', minHeight: '100%'}}
      >
        <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        {children}
        <Footer />
      </Stack>
    </Stack>
  );
};

export default MainLayout;
