import { eventInterceptor } from '../libs/utils';
import { success, internalError, unauthorized, notImplemented } from '../../common/src/response';
import { authorize } from '../libs/authorizerService';
import {
  createMunicipalityOrder,
  enableMunicipalityOrder,
  disableMunicipalityOrder,
  removeMunicipalityOrder,
} from './orders/OnBoardingMunicipalityOrders';
import { runOrders } from '../libs/OrderService';

const createOrUpdate = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      },
    } = event;
    if (!await authorize(event, municipality, false)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    cb(null, success(await runOrders(createMunicipalityOrder(municipality))));
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

const remove = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      },
    } = event;
    if (!await authorize(event, municipality, false)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    const order = removeMunicipalityOrder(municipality);
    cb(null, success(await runOrders(order, false)));
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

const enable = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      },
    } = event;
    try {
      cb(null, success(await runOrders(enableMunicipalityOrder(municipality), false)));
      return;
    } catch (e) {
      if (e instanceof Array) {
        cb(null, success(e));
        return;
      }
      throw e;
    }
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

const disable = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      },
    } = event;
    try {
      cb(null, success(await runOrders(disableMunicipalityOrder(municipality), false)));
      return;
    } catch (e) {
      if (e instanceof Array) {
        cb(null, success(e));
        return;
      }
      throw e;
    }
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

module.exports.enable = async (event, ctx, cb) => {
  eventInterceptor(event);
  console.log(event);
  const {
    pathParameters: {
      municipality,
    },
    httpMethod,
  } = event;
  if (!await authorize(event, municipality, false)) {
    cb(null, unauthorized('Unauthorized'));
    return;
  }
  switch (httpMethod) {
    case 'POST':
    case 'PUT':
      enable(event, ctx, cb);
      break;
    case 'DELETE':
      disable(event, ctx, cb);
      break;
    default:
      cb(null, notImplemented('Not implemented yet.'));
      break;
  }
};

module.exports.handler = (event, ctx, cb) => {
  eventInterceptor(event);
  console.log(event);
  const { httpMethod } = event;
  switch (httpMethod) {
    case 'POST':
    case 'PUT':
      createOrUpdate(event, ctx, cb);
      break;
    case 'DELETE':
      remove(event, ctx, cb);
      break;
    default:
      cb(null, notImplemented('Not implemented yet.'));
      break;
  }
};
