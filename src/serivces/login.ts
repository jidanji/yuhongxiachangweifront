/* eslint-disable */
import { request } from '@/utils/Request';

import { MathSoftAuthPlatFormBaseUrl } from '@/utils/domain';

//当断当前的用户状态
export const LoginStatus = (options) => {
  return request(`${MathSoftAuthPlatFormBaseUrl}/Admin/Login/LoginStatus`, {
    method: 'POST',
    ...options,
  });
};
