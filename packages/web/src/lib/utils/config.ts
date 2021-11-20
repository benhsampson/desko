import getConfig from 'next/config';

import { ConfigVars } from '../types/ConfigVars';

const { publicRuntimeConfig: config } = getConfig() as ConfigVars;

export default config;
