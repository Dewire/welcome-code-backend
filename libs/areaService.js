import { Area, AreaOverview } from './dynamoDB'; // TODO use areaOverviewService instead
import { publicAPI as publicMuniAPI, adminAPI as adminMuniAPI } from './municipalityService';
import {
  getAreaOverViewByAreaId,
} from './areaOverviewService';
import { AppError } from '../../common/src/AppError';
import { globalUpdateOptions } from './config';

const debug = require('debug')('Welcome::AreaService');


export class AreaServiceError extends AppError {}
export class NotFoundError extends AreaServiceError {}

export const getAreasInMunicipality = async (obj) => {
  debug('getAreasInMunicipality(', obj, ')');
  const { municipalityId } = obj;
  return Area.scan('municipalityId').eq(municipalityId).exec();
};

export const getAreasFromMunicipalityName = async (municipality, muniAPI = publicMuniAPI) => {
  debug('getAreasFromMunicipalityName(', municipality, ')');

  const municipaliyResult = await muniAPI.getByName(municipality);
  if (!municipaliyResult) {
    throw new NotFoundError(`Municipality '${municipality}' not found.`);
  }
  debug('municipaliyResult', municipaliyResult);
  const areaResult = await Area.query('municipalityId').using('municipalityIndex').eq(municipaliyResult.municipalityId).exec();
  if (!areaResult) {
    throw new NotFoundError(`No Area found for municipalityId: '${municipaliyResult.municipalityId}'.`);
  }
  return areaResult;
};

export const getAreasExcludeByMunicipality = async (obj, muniAPI = publicMuniAPI) => {
  const { municipalityId } = obj;
  const areasPerMuni = await Promise.all((await muniAPI.getAll()).filter(m => m.municipalityId !== municipalityId).map(m => Area.query('municipalityId').using('municipalityIndex').eq(m.municipalityId).exec()));
  const areas = areasPerMuni.reduce((arr, muniAreas) => arr.concat(muniAreas), []);
  if (areas.length === 0) {
    console.log(`No Areas found when excluding municipalityId: '${municipalityId}'.`);
    throw new NotFoundError(`No Areas found when excluding municipalityId: '${municipalityId}'.`);
  }
  return areas;
};

export const getById = async (areaId) => {
  debug('getById(', areaId, ')');
  return Area.queryOne('areaId').eq(areaId).exec();
};

export const getAllAreas = () => {
  debug('getAllAreas()');
  Area.scan().exec();
};

export const update = async (obj) => {
  const data = obj;
  data.area.name = data.area.name.toLowerCase();
  delete data.area.createdAt;
  delete data.areaOverview.createdAt;
  return Promise.all([
    Area
      .update(
        { areaId: data.area.areaId, name: data.area.name },
        { $PUT: obj.area },
        globalUpdateOptions,
      ),
    AreaOverview
      .update({ id: data.areaOverview.id }, { $PUT: obj.areaOverview }, globalUpdateOptions),
  ]);
};

export const del = async (obj) => {
  debug('areaService.del(', obj, ')');
  const res = [];
  res.push(await (await Area.get(obj.area.areaId)).delete());
  debug('deleted area');
  const overview = await AreaOverview.get(obj.areaOverview.id);
  if (overview) {
    debug(`deleting areaOverview with id ${overview.id}`);
    res.push(await overview.delete());
  }
  res.push(await Area.delete({ areaId: obj.area.areaId, name: obj.area.name }));
  return res;
};

export const delById = async (areaId) => {
  debug('delById(', areaId, ')');
  return del({
    areaOverview: await getAreaOverViewByAreaId(areaId),
    area: await getById(areaId),
  });
};

export const publicAPI = {
  getAreasInMunicipality,
  getAreasFromMunicipalityName,
  getAreasExcludeByMunicipality,
  getAllAreas,
};

export const adminAPI = {
  ...publicAPI,
  getAreasFromMunicipalityName: async name => getAreasFromMunicipalityName(name, adminMuniAPI),
  getAreasExcludeByMunicipality: async obj =>
    getAreasExcludeByMunicipality(obj, adminMuniAPI),
  update,
};

export const appAdminAPI = {
  ...adminAPI,
  delete: del,
  delById,
};
