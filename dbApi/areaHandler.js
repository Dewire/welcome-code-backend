import { eventInterceptor } from '../libs/utils';
import { success, error, unauthorized, notImplemented,
  methodNotAllowed, notFound } from '../../common/src/response';
import { getById as getMunicipalityById } from '../libs/municipalityService';
import { authorize } from '../libs/authorizerService';
import {
  adminAPI,
  appAdminAPI,
} from '../libs/areaService';

const debug = require('debug')('Welcome::DB::AreaHandler');

const update = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipalityId,
    } = {},
    body,
  } = event;
  if (!municipalityId) {
    cb(null, methodNotAllowed());
    return;
  }
  const dbMun = (await getMunicipalityById(municipalityId));
  if (!dbMun) {
    cb(null, notFound(`A municipality with id ${municipalityId} doesn't exist.`));
    return;
  }
  const { name: munName } = dbMun;
  if (!await authorize(event, munName)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }

  const obj = JSON.parse(body);
  obj.municipalityId = municipalityId;
  cb(null, success(await adminAPI.update(obj)));
};

const get = async (event, ctx, cb) => {
  const {
    pathParameters: {
      areaId,
    } = {},
  } = event;
  const areaItem = await adminAPI.getById(areaId);
  const dbMun = (await getMunicipalityById(areaItem.municipalityId));
  if (dbMun.length === 0) {
    cb(null, notFound(`A municipality with id ${areaItem.municipalityId} doesn't exist.`));
    return;
  }
  const { name: munName } = dbMun[0];
  if (!await authorize(event, munName)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(areaItem));
};

const del = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipalityId,
    } = {},
    body,
  } = event;
  if (!municipalityId) {
    cb(null, methodNotAllowed());
    return;
  }
  const dbMun = (await getMunicipalityById(municipalityId));
  if (!dbMun) {
    cb(null, notFound());
    return;
  }
  const { name: munName } = dbMun;
  if (!await authorize(event, munName)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  const obj = JSON.parse(body);
  cb(null, success(await appAdminAPI.delete(obj)));
};

const delAll = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  if (!municipality) {
    cb(null, methodNotAllowed());
    return;
  }
  if (!await authorize(event, municipality)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(await Promise.all((
    await appAdminAPI.getAreasFromMunicipalityName(municipality))
    .map(async area => appAdminAPI.delById(area.areaId)))));
};


export const list = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    debug(event);
    const municipality = event.pathParameters.municipality ||
      await getMunicipalityById(event.pathParameters.municipalityId);
    if (!await authorize(event, municipality)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    let result;
    if (municipality) {
      result = await adminAPI.getAreasFromMunicipalityName(municipality);
    } else {
      result = await adminAPI.getAll();
    }

    if (!result) {
      console.log(`No Areas found for municipality: '${municipality}'.`);
      cb(null, notFound({ msg: `No Areas found for municipality: '${municipality}'.` }));
      return;
    }
    cb(null, success(result));
    return;
  } catch (e) {
    console.error(e);
    cb(null, error(e));
  }
};

export const CRUD = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    debug(event);
    const { httpMethod } = event;

    switch (httpMethod) {
      case 'PUT':
        return update(event, ctx, cb);
      case 'GET':
        return get(event, ctx, cb);
      case 'DELETE':
        return del(event, ctx, cb);
      default:
        cb(null, notImplemented('Not implemented yet.'));
        return undefined;
    }
  } catch (e) {
    console.error(e);
    return cb(null, error(e));
  }
};

export const municipalityCrud = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    debug(event);
    const { httpMethod } = event;

    switch (httpMethod) {
      case 'GET':
        return list(event, ctx, cb);
      case 'DELETE':
        return delAll(event, ctx, cb);
      default:
        cb(null, notImplemented('Not implemented yet.'));
        return undefined;
    }
  } catch (e) {
    console.error(e);
    return cb(null, error(e));
  }
};
