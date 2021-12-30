import Image from 'next/image';
import { Typography } from '@mui/material';

type Props = {
  contrast?: boolean;
};

export default function Logo({ contrast }: Props) {
  return (
    <>
      <Image src="/Logo.svg" alt="Logo" height={24} width={24} />
      <Typography
        variant="h6"
        lineHeight={1}
        sx={{
          color: contrast ? 'primary.contrastText' : 'text.primary',
          ml: 1,
        }}
      >
        desko.io
      </Typography>
    </>
  );
}
