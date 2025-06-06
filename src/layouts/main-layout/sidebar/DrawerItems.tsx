import { useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ButtonBase from '@mui/material/ButtonBase';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import HorizonLogo from 'assets/images/logo-main.png';
import Image from 'components/base/Image';
import SidebarCard from './SidebarCard';
import sitemap from 'routes/sitemap';

interface DrawerItemsProps {
  handleDrawerClose?: () => void;
}

const DrawerItems = ({ handleDrawerClose }: DrawerItemsProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <Box
        pt={5}
        pb={4.5}
        px={4.5}
        justifyContent="center"
        position="sticky"
        top={0}
        borderBottom={1}
        borderColor="info.main"
        bgcolor="info.lighter"
        zIndex={1000}
        width="100%"
        display="flex"
      >
        <ButtonBase component={Link} href="/" disableRipple>
          <Image src={HorizonLogo} alt="logo" height={60} width={100} sx={{ mr: 1.75 }} />
        </ButtonBase>
      </Box>

      <List component="nav" sx={{ mt: 2.5, mb: 10, p: 0, pl: 3 }}>
        {sitemap.map((route) => {
          const isActive = pathname === route.path;
          return route.items ? (
            <CollapseListItem
              key={route.id}
              {...route}
              active={isActive}
              handleDrawerClose={handleDrawerClose}
            />
          ) : (
            <ListItem
              key={route.id}
              {...route}
              active={isActive}
              handleDrawerClose={handleDrawerClose}
            />
          );
        })}
      </List>

      <Box mt="auto" px={3} pt={15} pb={5}>
        <SidebarCard />
      </Box>
    </>
  );
};

export default DrawerItems;