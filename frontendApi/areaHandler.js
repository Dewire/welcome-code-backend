import { eventInterceptor } from '../libs/utils';
import { success, internalError,
  notFound } from '../../common/src/response';
import {
  publicAPI,
  NotFoundError,
} from '../libs/areaService';

export const getAreas = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const { municipalityId } = event.pathParameters;
    const areas = await api.getAreasInMunicipality({ municipalityId });
    cb(null, success(areas));
  } catch (e) {
    if (e instanceof NotFoundError) {
      cb(null, notFound(e));
      return;
    }
    cb(null, internalError(e));
  }
};


export const getAreasByMunicipalityName = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const { municipality } = event.pathParameters;
    const areas = await api.getAreasFromMunicipalityName(municipality);
    cb(null, success(areas));
  } catch (e) {
    if (e instanceof NotFoundError) {
      cb(null, notFound(e));
      return;
    }
    cb(null, internalError(e));
  }
};

export const getAreasExcludeByMunicipalityId = async (event, context, cb, api = publicAPI) => {
  eventInterceptor(event);
  try {
    const { municipalityId } = event.pathParameters;
    const areas = await api.getAreasExcludeByMunicipality({ municipalityId });
    cb(null, success(areas));
  } catch (e) {
    if (e instanceof NotFoundError) {
      console.log(e);
      cb(null, success([]));
      return;
    }
    cb(null, internalError(e));
  }
};
