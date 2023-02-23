/* eslint-disable */
import { request } from '@/utils/Request';

import { apiBaseUrl as BaseUrl } from '@/utils/domain';

export const Add = (options) => {
  return request(`${BaseUrl}/management/Drug/Add`, {
    method: 'POST',
    ...options,
  });
};

export const Search = (options) => {
  return request(`${BaseUrl}/management/Drug/Search`, {
    method: 'POST',
    ...options,
  });
};

export const Update = (options) => {
  return request(`${BaseUrl}/management/Drug/Update`, {
    method: 'POST',
    ...options,
  });
};

export const Delete = (options) => {
  return request(`${BaseUrl}/management/Drug/Delete`, {
    method: 'POST',
    ...options,
  });
};
