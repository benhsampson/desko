import getConfig from 'next/config';

type NextConfig = {
  publicRuntimeConfig: {
    API_URL: string;
  };
};

const { publicRuntimeConfig: config } = getConfig() as NextConfig;

export default config;
