import { Typography } from '@mui/material';

type Props = {
  contrast?: boolean;
};

export default function Logo({ contrast }: Props) {
  return (
    <Typography
      variant="h6"
      lineHeight={1}
      sx={{ color: contrast ? 'primary.contrastText' : 'text.primary' }}
    >
      desko.io
    </Typography>
  );
}
