import { eventInterceptor } from '../libs/utils';
import { success, error, unauthorized, notImplemented,
  methodNotAllowed, notFound } from '../../common/src/response';
import { getById as getMunicipalityById } from '../libs/municipalityService';
import { authorize } from '../libs/authorizerService';
import {
  adminAPI,
} from '../libs/aboutMunicipalityService';

const debug = require('debug')('Welcome::DB::AboutMunicipality');

const post = async (event, ctx, cb) => {
  const {
    body,
  } = event;
  const aboutMunicipality = JSON.parse(body);

  const municipality = aboutMunicipality.aboutMunicipalityId || aboutMunicipality.municipalityId;
  aboutMunicipality.aboutMunicipalityId = municipality;
  aboutMunicipality.municipalityId = municipality;
  if (!municipality) {
    cb(null, methodNotAllowed());
    return;
  }
  const dbMun = (await getMunicipalityById(municipality));
  if (!dbMun) {
    cb(null, notFound(`A municipality with id ${municipality} doesn't exist.`));
    return;
  }
  const { name: munName } = dbMun;
  if (!await authorize(event, munName, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(await adminAPI.create(aboutMunicipality)));
};

const get = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  debug('getAbout: ', municipality);
  let res;
  if (municipality) {
    res = await adminAPI.getAboutInMunicipality(municipality);
  } else {
    res = await adminAPI.getAll();
  }
  debug('getAbout: ', res);
  cb(null, success(res));
};

const update = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
    body,
  } = event;
  if (!municipality) {
    cb(null, methodNotAllowed());
    return;
  }
  const dbMun = (await getMunicipalityById(municipality));
  if (!dbMun) {
    cb(null, notFound(`A municipality with id ${municipality} doesn't exist.`));
    return;
  }
  const { name: munName } = dbMun;
  if (!await authorize(event, munName)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  if (!await adminAPI.get(municipality)) {
    cb(null, notFound(`There is no item for AboutMunicipality with id ${municipality}.`));
    return;
  }
  const aboutMunicipality = JSON.parse(body);
  aboutMunicipality.aboutMunicipalityId = municipality;
  aboutMunicipality.municipalityId = municipality;
  cb(null, success(await adminAPI.update(aboutMunicipality)));
};

const del = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  if (!municipality) {
    cb(null, methodNotAllowed());
    return;
  }
  const dbMun = (await adminAPI.getAboutMunicipalityById(municipality));
  if (!dbMun) {
    cb(null, notFound());
    return;
  }
  const { name: munName } = dbMun;
  if (!await authorize(event, munName, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }

  cb(null, await adminAPI.deleteAboutMuncipality(municipality));
};

export const CRUD = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    console.log(event);
    const { httpMethod } = event;

    switch (httpMethod) {
      case 'POST':
        return post(event, ctx, cb);
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
    console.log(e);
    cb(null, error(e));
    return undefined;
  }
};
