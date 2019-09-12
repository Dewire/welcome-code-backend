import {
  adminAPI,
} from '../libs/areaService';
import * as frontHandler from '../frontendApi/areaHandler';

export const getAreas =
  async (event, context, cb) => frontHandler.getAreas(event, context, cb, adminAPI);


export const getAreasByMunicipalityName =
  async (event, context, cb) =>
    frontHandler.getAreasByMunicipalityName(event, context, cb, adminAPI);

export const getAreasExcludeByMunicipalityId =
  async (event, context, cb) =>
    frontHandler.getAreasExcludeByMunicipalityId(event, context, cb, adminAPI);
