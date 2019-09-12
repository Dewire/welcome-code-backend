import { AppError } from '../../common/src/AppError';
import {
  AboutMunicipality,
} from './dynamoDB';
import { publicAPI as pubMuniApi, adminAPI as adminMuniAPI } from './municipalityService';
import { globalUpdateOptions } from './config';

const debug = require('debug')('Welcome::AboutMunicipalityService');


export class NotFoundError extends AppError {}

export const getByMuniId = async id => AboutMunicipality.queryOne('municipalityId').using('MunicipalityIndex').eq(id).exec();
export const getAboutInMunicipality = async (municipality, municipalityService = pubMuniApi) => {
  debug(`getAboutInMunicipality(${municipality})`);
  const muni = await municipalityService.getByName(municipality);
  if (!muni) {
    throw new NotFoundError(`Municipality '${municipality}' not found.`);
  }
  const aboutMuni = await AboutMunicipality.queryOne('aboutMunicipalityId').eq(muni.municipalityId).exec();
  if (!aboutMuni) {
    throw new NotFoundError(`No AboutMunicipality found for municipalityId: '${muni.municipalityId}'.`);
  }
  debug('returns ', aboutMuni);
  return aboutMuni;
};

export const create = async (obj) => {
  if (await getByMuniId(obj.municipalityId)) {
    throw new Error(`municipalityId: ${obj.municipalityId} already exists.`);
  }
  if (await AboutMunicipality
    .scan('aboutMunicipalityId')
    .eq(obj.aboutMunicipalityId)
    .exec().length > 0) {
    throw new Error(`aboutMunicipalityId: ${obj.aboutMunicipalityId} already exists.`);
  }
  return AboutMunicipality.create(obj);
};

// TODO Only allow updates on existing items.
// As it is municipality admins can create their own municipalities if
// it doesn't already exist.
export const update = async (obj) => {
  const key = { aboutMunicipalityId: obj.aboutMunicipalityId };
  const operation = { $PUT: obj };
  return AboutMunicipality.update(key, operation, globalUpdateOptions);
};

export const createByName = async (muncipalityName, obj) => {
  const municipality = await adminMuniAPI.getByName(muncipalityName);
  if (municipality && municipality.municipalityId) {
    return create(Object.assign({}, obj, {
      municipalityId: municipality.municipalityId,
      aboutMunicipalityId: municipality.municipalityId,
    }));
  }
  return Promise.reject;
};


export const getAll = async () => AboutMunicipality.scan();

export const get = async aboutMunicipalityId => AboutMunicipality.get({ aboutMunicipalityId });

export const del = async aboutMunicipalityId => AboutMunicipality.delete({ aboutMunicipalityId });

export const delByName = async (muncipalityName) => {
  const municipality = await adminMuniAPI.getByName(muncipalityName);
  if (municipality && municipality.municipalityId) {
    return del(municipality.municipalityId);
  }
  return Promise.reject;
};


export const publicAPI = {
  getAboutInMunicipality,
  getAll,
  get,
};

export const adminAPI = {
  getAll,
  get,
  getAboutInMunicipality: async municipality => getAboutInMunicipality(municipality, adminMuniAPI),
  create,
  createByName,
  update,
  del,
  delByName,
};

export const appAdminAPI = {
  ...adminAPI,
};
