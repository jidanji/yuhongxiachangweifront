import env from './env';

const apiBaseUrlBase = {
  prod: 'http://139.224.193.145:7744',
  development: '/api',
};

export const apiBaseUrl = apiBaseUrlBase[env];
