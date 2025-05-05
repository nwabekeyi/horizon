import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Typography
      mt={0.5}
      px={1}
      py={3}
      color="text.secondary"
      variant="body2"
      sx={{ textAlign: { xs: 'center', md: 'right' } }}
      letterSpacing={0.5}
      fontWeight={500}
    >
      © {currentYear} {' '}
      <Link href="/"  fontWeight={600} color='info.darker'>
        247AT
      </Link>
    </Typography>
  );
};

export default Footer;
