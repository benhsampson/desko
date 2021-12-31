import Image from 'next/image';

export default function Logo() {
  return (
    <>
      <Image src="/Logo.svg" alt="Logo" height={51.2} width={128} />
    </>
  );
}
