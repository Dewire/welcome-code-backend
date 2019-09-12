import { eventInterceptor } from '../libs/utils';
import { publicAPI, NotFoundError } from '../libs/aboutMunicipalityService';
import { success, internalError, notFound } from '../../common/src/response';

export const getAboutMunicipality = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  const { municipality } = event.pathParameters;
  try {
    cb(null, success(await api.getAboutInMunicipality(municipality)));
  } catch (e) {
    if (e instanceof NotFoundError) {
      cb(null, notFound(e));
    } else {
      cb(null, internalError(e));
    }
  }
};
