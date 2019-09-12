import { eventInterceptor } from '../libs/utils';
import { success, internalError, notFound } from '../../common/src/response';
import { publicAPI } from '../libs/municipalityService';

export const getStartPageData = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const { municipality } = event.pathParameters;

    const result = await api.getByName(municipality);
    if (!result) {
      cb(null, notFound({ msg: `Municipality '${municipality}' not found.` }));
      return;
    }
    // TODO: Return only relevant preamble for language
    cb(null, success(result));
    return;
  } catch (err) {
    cb(null, internalError(err));
  }
};
