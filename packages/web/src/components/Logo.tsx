import Image from 'next/image';

type Props = {
  contrast?: boolean;
};

export default function Logo({ contrast }: Props) {
  return (
    <>
      <Image src="/Logo.svg" alt="Logo" height={51.2} width={128} />
    </>
  );
}
