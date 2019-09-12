import { success, error, notFound } from '../../common/src/response';
import { AboutService } from './dynamoDB';

const aboutServiceId = 1; // TODO: We are probably gonna get data by modified date in the future

export const getAboutService = (cb) => {
  AboutService.get(aboutServiceId, (err, result) => {
    if (err) {
      cb(null, error(err));
    } else if (!result) {
      cb(null, notFound({ msg: `AboutService '${aboutServiceId}' not found.` }));
    } else {
      cb(null, success(result));
    }
  });
};
