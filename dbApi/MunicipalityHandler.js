import { eventInterceptor } from '../libs/utils';
import { success, internalError, notFound, unauthorized, notImplemented } from '../../common/src/response';
import { authorize } from '../libs/authorizerService';
import { adminAPI, appAdminAPI } from '../libs/municipalityService';


const post = async (event, ctx, cb) => {
  const {
    body,
  } = event;
  const data = JSON.parse(body);
  const { name: municipality } = data;
  if (!await authorize(event, municipality, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(await appAdminAPI
    .create(municipality, data)));
};

const get = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  const muni = await adminAPI
    .getByName(municipality);
  if (!muni) {
    cb(null, notFound(`Municipality ${municipality} not found.`));
    return;
  }
  cb(null, success(muni));
};

export const getAll = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    const munis = await adminAPI
      .getAll();
    cb(null, success(munis));
  } catch (e) {
    cb(null, internalError(e));
  }
};

const update = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
    body,
  } = event;
  if (!await authorize(event, municipality)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(await adminAPI
    .update(municipality, JSON.parse(body))));
};

export const updateMapCredentials = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    const {
      pathParameters: {
        municipality,
      } = {},
      body,
    } = event;
    if (!await authorize(event, municipality, false)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    cb(null, success(await appAdminAPI
      .updateMapCredentials(municipality, JSON.parse(body))));
  } catch (e) {
    cb(null, internalError(e));
  }
};

const del = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      } = {},
    } = event;
    if (!await authorize(event, municipality, false)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    cb(null, success(await appAdminAPI
      .delByName(municipality)));
  } catch (e) {
    cb(null, internalError(e));
  }
};

export const CRUD = (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    console.log(event);
    const { httpMethod } = event;

    switch (httpMethod) {
      case 'POST':
        post(event, ctx, cb);
        return;
      case 'PUT':
        update(event, ctx, cb);
        return;
      case 'GET':
        get(event, ctx, cb);
        return;
      case 'DELETE':
        del(event, ctx, cb);
        return;
      default:
        cb(null, notImplemented('Not implemented yet.'));
    }
  } catch (e) {
    cb(null, internalError(e));
  }
};
