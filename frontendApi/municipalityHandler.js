import { eventInterceptor } from '../libs/utils';
import { publicAPI } from '../libs/municipalityService';
import { success, internalError, notFound } from '../../common/src/response';

const debug = require('debug')('Welcome::API::MunicipalityHandler');

export const getAllData = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const res = await api.getAll();
    cb(null, success(res));
  } catch (e) {
    debug(e.stack.split('\n'));
    cb(null, internalError(e));
  }
};

export const getDataById = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const { municipalityId } = event.pathParameters;
    const result = await api.getById(municipalityId);
    if (!result) {
      cb(null, notFound({ msg: `Municipality '${municipalityId}' not found.` }));
    } else {
      cb(null, success(result));
    }
  } catch (e) {
    cb(null, internalError(e));
  }
};
