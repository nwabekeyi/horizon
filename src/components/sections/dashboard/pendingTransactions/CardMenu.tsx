import Stack from '@mui/material/Stack';


interface CardMenuProps {
  transactionId: string;
  onAction: (action: string, transactionId: string) => void;
}

const CardMenu = ({ transactionId, onAction }: CardMenuProps) => {
  return (
    <Stack spacing={1} sx={{ px: 2, pb: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ cursor: 'pointer' }}
        onClick={() => onAction('Retry Transaction', transactionId)}
      >
      </Stack>
    </Stack>
  );
};

export default CardMenu;
