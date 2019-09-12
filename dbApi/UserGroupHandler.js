import { eventInterceptor } from '../libs/utils';
import { success, internalError, unauthorized, notImplemented } from '../../common/src/response';
import { authorize } from '../libs/authorizerService';
import { appAdminAPI } from '../libs/UserGroupService';

const debug = require('debug')('Welcome::DB::UserGroupHandler');


const update = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
    body,
  } = event;
  const data = JSON.parse(body);
  if (!await authorize(event, municipality, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  debug('key: ', municipality);
  debug('update: ', data);
  cb(null, success(await appAdminAPI.setGroups(municipality, data)));
};

const get = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  if (!await authorize(event, municipality, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  console.log(`key: ${JSON.stringify({ id: municipality })}`);
  cb(null, success(await appAdminAPI.getGroupsByName(municipality)));
};

const del = async (event, ctx, cb) => {
  const {
    pathParameters: {
      municipality,
    } = {},
  } = event;
  if (!await authorize(event, municipality, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  cb(null, success(await appAdminAPI.delByName(municipality)));
};

export const CRUD = async (event, ctx, cb) => {
  try {
    eventInterceptor(event);
    console.log(event);
    const { httpMethod } = event;

    switch (httpMethod) {
      case 'PUT':
      case 'POST':
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
    if (e.stack) {
      cb(null, internalError(e.stack.split('\n')));
    } else {
      cb(null, internalError(e));
    }
    return undefined;
  }
};
