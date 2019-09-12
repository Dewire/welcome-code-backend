import { generate } from 'shortid';
import { encryptString } from '../../common/src/encryptionService';
import { Municipality } from './dynamoDB';
import { AppError } from '../../common/src/AppError';
import { globalUpdateOptions } from './config';

const debug = require('debug')('Welcome:MunicipalityService');

export class MunicipalityError extends AppError {}

export const create = async (municipality, obj) => {
  // TODO clone object instead of modifying input paramter
  const saveObj = obj;
  saveObj.name = municipality.toLowerCase();
  saveObj.municipalityId = generate();
  const existingMunicipality = await Municipality
    .scan('name')
    .eq(obj.name)
    .exec();
  if (existingMunicipality && existingMunicipality.length > 0) {
    throw new Error(`municipality ${obj.name} already exists.`);
  }
  if (saveObj.mapCredentials) {
    const username = encryptString(saveObj.mapCredentials.username);
    const password = encryptString(saveObj.mapCredentials.password);
    saveObj.mapCredentials.username = JSON.parse(username);
    saveObj.mapCredentials.password = JSON.parse(password);
  }
  if (!saveObj.enabled) {
    saveObj.enabled = false;
  }
  return Municipality.create(saveObj);
};

export const update = async (municipality, obj) => {
  const data = obj;
  // Immutable keys
  delete data.municipalityId;
  delete data.name;
  delete data.mapCredentials;

  const key = { name: municipality.toLowerCase() };
  const operation = { $PUT: data };
  return Municipality.update(key, operation, globalUpdateOptions);
};

export const updateMapCredentials = async (municipality, obj) => {
  const {
    username,
    password,
  } = obj;
  // ensure that we only update map credentials
  const encUsername = encryptString(username);
  const encPass = encryptString(password);
  const data = {
    mapCredentials: {
      username: JSON.parse(encUsername),
      password: JSON.parse(encPass),
    },
  };

  const key = { name: municipality.toLowerCase() };
  const operation = { $PUT: data };
  return Municipality.update(key, operation, globalUpdateOptions);
};

export const getByName = async name =>
  Municipality
    .queryOne('name').eq(name.toLowerCase())
    .exec();

export const getEnabledByName = async (name) => {
  debug(`-----getEnabledByName(${name})-----`);
  if (Municipality === undefined) {
    throw new MunicipalityError('Municipality is undefined.');
  }
  const query = Municipality
    .queryOne('name').using('EnabledIndex');
  if (query === undefined) {
    throw new MunicipalityError(`Index [${query}] not found in Municipality.`);
  }
  return query.eq(name.toLowerCase())
    .where('enabled').eq(true).exec();
};

export const getById = async municipalityId => Municipality
  .queryOne('municipalityId').eq(municipalityId)
  .exec();

export const getEnabledById = async municipalityId => Municipality
  .queryOne('municipalityId')
  .using('IdIndexEnabledRange')
  .eq(municipalityId)
  // eslint-disable-next-line newline-per-chained-call
  .where('enabled').eq(true)
  .exec();

export const delByName = async name => Municipality.delete({ name: name.toLowerCase() });
export const delById = async municipalityId => Municipality.delete({ municipalityId });

export const getAll = async () =>
  Municipality.scan().where('name').not().eq('dewire')
    .exec();

export const getAllEnabled = async () => {
  try {
    return await Municipality
      .scan('enabled').eq(true)
      // eslint-disable-next-line newline-per-chained-call
      .and().where('name').not().eq('dewire')
      .exec();
  } catch (e) {
    debug('Error thrown');
    debug(e.stack.split('\n'));
    throw e;
  }
};


export const publicAPI = {
  getAll: getAllEnabled,
  getByName: async name => getEnabledByName(name),
  getById: getEnabledById,
};

export const adminAPI = {
  getAll,
  getAllEnabled,
  getByName,
  getEnabledByName,
  getById,
  getEnabledById,
  update: async (muncipality, obj) => {
    // TODO clone object instead of modifying the input parameter
    // eslint-disable-next-line no-param-reassign
    delete obj.enabled;
    return update(muncipality, obj);
  },
};

export const appAdminAPI = {
  ...adminAPI,
  create,
  delByName,
  delById,
  update,
  updateMapCredentials,
};
