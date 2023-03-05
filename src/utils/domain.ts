import env from './env';

const apiBaseUrlBase = {
  prod: 'http://139.224.193.145:7744',
  development: 'http://localhost:51055',
};

const MathSoftAuthPlatForm = {
  prod: 'http://139.224.193.145:7744',
  development: 'http://localhost:54904',
};

export const apiBaseUrl = apiBaseUrlBase[env];

export const MathSoftAuthPlatFormBaseUrl = MathSoftAuthPlatForm[env];
