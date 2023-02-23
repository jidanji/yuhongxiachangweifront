/* eslint-disable */
import { request } from '@/utils/Request';

import { apiBaseUrl as BaseUrl } from '@/utils/domain';

export const Search = (options) => {
  return request(`${BaseUrl}/management/Ingredient/Search`, {
    method: 'POST',
    ...options,
  });
};

export const Add = (options) => {
  return request(`${BaseUrl}/management/Ingredient/Add`, {
    method: 'POST',
    ...options,
  });
};

export const Update = (options) => {
  return request(`${BaseUrl}/management/Ingredient/Update`, {
    method: 'POST',
    ...options,
  });
};

export const Delete = (options) => {
  return request(`${BaseUrl}/management/Ingredient/Delete`, {
    method: 'POST',
    ...options,
  });
};
