import { eventInterceptor } from '../libs/utils';
import { getAboutService } from '../libs/aboutService';
import { error } from '../../common/src/response';

export const getAboutServiceData = (event, content, cb) => {
  try {
    eventInterceptor(event);
    return getAboutService(cb);
  } catch (e) {
    console.log(e);
    cb(null, error(e));
    return undefined;
  }
};
