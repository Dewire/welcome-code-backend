import { eventInterceptor } from '../libs/utils';
import { getAboutService } from '../libs/aboutService';

export const getAboutServiceData = (event, content, cb) => {
  eventInterceptor(event);
  return getAboutService(cb);
};
